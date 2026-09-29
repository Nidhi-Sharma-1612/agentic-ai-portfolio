import { z } from "zod";
import { profile } from "@/lib/data";
import { clientIp, rateLimit, sameOrigin } from "@/lib/rate-limit";

// Contact form → email via Resend (https://resend.com, free tier).
// Needs RESEND_API_KEY; CONTACT_TO_EMAIL defaults to the portfolio email.
// Without a key the endpoint answers 503 and the form falls back to mailto.

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(120),
  company: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().min(10).max(2000),
  // Honeypot: hidden from people, filled in by bots.
  website: z.string().max(200).optional().default(""),
});

const json = (status: number, body: Record<string, unknown>, headers?: HeadersInit) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

// Strips control characters so user input can't inject email headers.
const clean = (s: string) => s.replace(/[\r\n\t\0]+/g, " ").trim();

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json(403, { error: "forbidden" });
  if (!req.headers.get("content-type")?.includes("application/json")) return json(415, { error: "bad_request" });
  if (Number(req.headers.get("content-length") ?? 0) > 8_000) return json(413, { error: "too_large" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json(503, { error: "not_configured" });

  const limit = await rateLimit(clientIp(req), "contact");
  if (!limit.ok) return json(429, { error: "rate_limited" }, { "Retry-After": String(limit.retryAfter) });

  let data: z.infer<typeof schema>;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return json(400, { error: "invalid", fields: Object.keys(parsed.error.flatten().fieldErrors) });
    data = parsed.data;
  } catch {
    return json(400, { error: "bad_request" });
  }

  // Bots that filled the honeypot get a fake success and nothing is sent.
  if (data.website) return json(200, { ok: true });

  const name = clean(data.name);
  const company = clean(data.company);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL ?? profile.email,
      reply_to: data.email,
      subject: `Portfolio: ${name}${company ? ` (${company})` : ""}`,
      text: `From: ${name} <${data.email}>\nCompany: ${company || "-"}\n\n${data.message}`,
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!res?.ok) return json(502, { error: "send_failed" });
  return json(200, { ok: true });
}
