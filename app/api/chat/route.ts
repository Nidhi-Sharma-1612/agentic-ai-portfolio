import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { agentInstructions, agentTools } from "@/lib/agent-context";
import { classifyQuestion, LIMITS, looksLikeInjection, REFUSALS, sanitizeMessages, textOf } from "@/lib/guardrails";
import { clientIp, rateLimit, sameOrigin } from "@/lib/rate-limit";

export const maxDuration = 30;

const MODELS = {
  anthropic: { label: "Claude Haiku 4.5", make: (id?: string) => anthropic(id ?? "claude-haiku-4-5") },
  openai: { label: "GPT-4o mini", make: (id?: string) => openai(id ?? "gpt-4o-mini") },
  google: { label: "Gemini 2.5 Flash", make: (id?: string) => google(id ?? "gemini-2.5-flash") },
};
const KEYS = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
} as const;

/** Model chosen via env. AI_PROVIDER = google (default) | anthropic | openai. */
function getModel() {
  const provider = (process.env.AI_PROVIDER ?? "google").toLowerCase() as keyof typeof MODELS;
  if (!(provider in MODELS) || !process.env[KEYS[provider]]) return null;
  const { label, make } = MODELS[provider];
  return { label, model: make(process.env.AI_MODEL || undefined) };
}

const json = (status: number, error: string, headers?: HeadersInit) => Response.json({ error }, { status, headers });

/** A fixed reply streamed in the same format as the agent, without calling the LLM. */
function cannedReply(text: string, guardrail: string) {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start", messageMetadata: { guardrail } });
      writer.write({ type: "text-start", id: "guardrail" });
      writer.write({ type: "text-delta", id: "guardrail", delta: text });
      writer.write({ type: "text-end", id: "guardrail" });
      writer.write({ type: "finish" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function withLimitHeaders(res: Response, remaining: number) {
  res.headers.set("X-RateLimit-Remaining", String(remaining));
  res.headers.set("Cache-Control", "no-store");
  return res;
}

/** Health check so the UI can show whether the agent is online and which model it uses. */
export function GET() {
  const active = getModel();
  return Response.json(
    { online: Boolean(active), model: active?.label ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const active = getModel();
  if (!active) return json(503, "offline");

  // Cheap checks first, before any work or LLM spend.
  if (!sameOrigin(req)) return json(403, "forbidden");
  if (!req.headers.get("content-type")?.includes("application/json")) return json(415, "bad_request");
  if (Number(req.headers.get("content-length") ?? 0) > LIMITS.bodyBytes) return json(413, "too_large");

  const limit = await rateLimit(clientIp(req));
  if (!limit.ok) {
    return json(429, "rate_limited", {
      "Retry-After": String(limit.retryAfter),
      "X-RateLimit-Scope": limit.tier ?? "",
    });
  }

  let raw: string;
  try {
    raw = await req.text();
    if (raw.length > LIMITS.bodyBytes) return json(413, "too_large");
  } catch {
    return json(400, "bad_request");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, "bad_request");
  }
  const messages = sanitizeMessages(body);
  if (!messages) return json(400, "bad_request");

  // Guardrails: regex screen, then a small LLM classifier.
  const question = textOf(messages.at(-1)!);
  if (looksLikeInjection(question)) {
    return withLimitHeaders(cannedReply(REFUSALS.injection, "injection"), limit.remaining);
  }
  const verdict = await classifyQuestion(active.model, messages);
  if (verdict !== "allowed") {
    return withLimitHeaders(cannedReply(REFUSALS[verdict], verdict), limit.remaining);
  }

  const result = streamText({
    model: active.model,
    instructions: agentInstructions,
    messages: await convertToModelMessages(messages),
    tools: agentTools,
    stopWhen: isStepCount(4),
    maxOutputTokens: 500,
    temperature: 0.3,
    abortSignal: AbortSignal.any([req.signal, AbortSignal.timeout(25_000)]),
  });

  const res = createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      // Never leak provider/internal error details to the browser.
      onError: () => "The agent hit an error. Please try again in a moment.",
    }),
  });
  return withLimitHeaders(res, limit.remaining);
}
