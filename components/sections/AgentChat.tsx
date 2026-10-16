"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, getToolName, isToolUIPart, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Check,
  ChevronRight,
  Cpu,
  Gauge,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  User,
} from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { profile } from "@/lib/data";

const MAX_CHARS = 500;

const starters = [
  "Why should we hire Nidhi for an AI Engineer role?",
  "What agentic frameworks has she used?",
  "What has she shipped to production?",
  "How can I contact her?",
];
const followUps = [
  "Tell me about her RAG projects",
  "What's her full-stack experience?",
  "Which project is she proudest of?",
  "Is she open to remote roles?",
  "What did she build at Flowlaunch?",
  "How was this agent built?",
];

const pipeline = [
  { label: "Your question", detail: "useChat → POST /api/chat" },
  { label: "Guardrails", detail: "origin check · rate limit · topic filter" },
  { label: "LLM + tool loop", detail: "streamText · up to 4 steps" },
  { label: "Portfolio tools", detail: "getProjects · getSkills · …" },
  { label: "Streamed answer", detail: "grounded in real data" },
];

const guardrails = [
  {
    icon: Target,
    title: "Stays on topic",
    text: "Answers only questions about Nidhi. Everything else is politely declined.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded answers",
    text: "Every fact comes from portfolio data via tools, never guesswork.",
  },
  {
    icon: Lock,
    title: "Injection-resistant",
    text: "Prompt-injection screen, sanitized history, server-only API keys.",
  },
  { icon: Gauge, title: "Rate limited", text: "Per-minute and daily limits per visitor, plus a global daily cap." },
];

const TOOL_LABELS: Record<string, string> = {
  getProfile: "Read profile",
  getExperience: "Checked experience",
  getProjects: "Searched projects",
  getSkills: "Checked skills",
  getContact: "Got contact details",
};

/** Tiny markdown renderer: **bold**, `- ` bullets and paragraphs. */
function RichText({ text }: { text: string }) {
  // **bold** and [label](url). Links are limited to https, mailto and same-site paths.
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((chunk, i) => {
      if (chunk.startsWith("**") && chunk.endsWith("**"))
        return (
          <strong key={i} className="font-semibold text-cyan">
            {chunk.slice(2, -2)}
          </strong>
        );
      const link = chunk.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) {
        const [, label, href] = link;
        if (!/^(https:\/\/|mailto:|\/(?!\/))/i.test(href)) return <Fragment key={i}>{label}</Fragment>;
        const external = href.startsWith("https://");
        return (
          <a
            key={i}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer nofollow" : undefined}
            className="text-cyan underline decoration-cyan/40 underline-offset-2 hover:decoration-cyan"
          >
            {label}
          </a>
        );
      }
      return <Fragment key={i}>{chunk}</Fragment>;
    });

  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={blocks.length} className="my-1.5 space-y-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <ChevronRight className="mt-1 size-3 shrink-0 text-violet" />
            <span>{inline(b)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) return bullets.push(bullet[1]);
    flush();
    if (line)
      blocks.push(
        <p key={blocks.length} className="my-1">
          {inline(line)}
        </p>,
      );
  });
  flush();
  return <>{blocks}</>;
}

function AgentSteps({ message }: { message: UIMessage }) {
  const steps = message.parts.filter(isToolUIPart);
  if (!steps.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {steps.map((part, i) => {
        const done = part.state === "output-available";
        const failed = part.state === "output-error";
        const name = getToolName(part);
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10.5px] text-ink/70"
          >
            {done ? (
              <Check className="size-3 text-emerald" />
            ) : failed ? (
              <span className="size-1.5 rounded-full bg-fuchsia" />
            ) : (
              <Loader2 className="size-3 animate-spin text-cyan" />
            )}
            {TOOL_LABELS[name] ?? name}
          </span>
        );
      })}
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const guardrail = (message.metadata as { guardrail?: string } | undefined)?.guardrail;
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-lg ${
          isUser ? "bg-white/10 text-ink" : "bg-gradient-to-br from-cyan to-violet text-void"
        }`}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </span>
      <div className={`flex max-w-[85%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && <AgentSteps message={message} />}
        {text && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser
                ? "rounded-tr-sm bg-cyan/15 text-ink"
                : guardrail
                  ? "rounded-tl-sm border border-amber-400/25 bg-amber-400/5 text-ink/90"
                  : "rounded-tl-sm bg-white/4 text-ink/90"
            }`}
          >
            {guardrail && (
              <span className="mb-1 flex items-center gap-1.5 font-mono text-[10.5px] tracking-wide text-amber-300/90 uppercase">
                <ShieldCheck className="size-3" /> Guardrail
              </span>
            )}
            {isUser ? text : <RichText text={text} />}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function errorText(error: Error) {
  const msg = error.message;
  if (msg.includes("offline"))
    return `The agent is offline right now. You can reach Nidhi directly at ${profile.email}.`;
  if (msg.includes("rate_limited"))
    return "You've reached the question limit for now. Please try again a little later.";
  if (msg.includes("forbidden")) return "This request was blocked. Please reload the page and try again.";
  if (msg.includes("too_large") || msg.includes("bad_request"))
    return "That message couldn't be sent. Try a shorter question.";
  return "Something went wrong reaching the agent. Please try again.";
}

type Status = { online: boolean; model: string | null } | null;

export function AgentChat() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (input, init) => {
          const res = await fetch(input, init);
          const left = res.headers.get("X-RateLimit-Remaining");
          if (left !== null) setRemaining(Number(left));
          if (res.status === 429) setRemaining(0);
          return res;
        },
      }),
  );
  const { messages, sendMessage, status, error, stop, setMessages, clearError, regenerate } = useChat({ transport });
  const [input, setInput] = useState("");
  const [agentStatus, setAgentStatus] = useState<Status>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    fetch("/api/chat", { cache: "no-store" })
      .then((r) => r.json())
      .then((s: Status) => setAgentStatus(s))
      .catch(() => setAgentStatus({ online: false, model: null }));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const asked = new Set(
    messages
      .filter((m) => m.role === "user")
      .map((m) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")),
  );
  const nextQuestions = followUps.filter((q) => !asked.has(q)).slice(0, 3);
  const showFollowUps = status === "ready" && !error && messages.at(-1)?.role === "assistant";
  const offline = agentStatus?.online === false;
  const outOfQuestions = remaining === 0;

  const send = (text: string) => {
    const trimmed = text.trim().slice(0, MAX_CHARS);
    if (!trimmed || busy || outOfQuestions) return;
    if (error) clearError();
    sendMessage({ text: trimmed });
    setInput("");
  };

  const reset = () => {
    stop();
    setMessages([]);
    clearError();
  };

  return (
    <section id="agent" className="relative scroll-mt-24 overflow-hidden py-28">
      <div className="absolute top-1/2 left-1/2 -z-10 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/10 blur-[120px]" />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          index="05"
          eyebrow="Live demo"
          title={
            <>
              Don&apos;t just read about it. <span className="text-gradient">Ask my agent.</span>
            </>
          }
          description="A real tool-calling AI agent, built into this site. Ask anything about my experience, projects or skills and watch it look up the answer."
        />

        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          {/* Chat — first on mobile */}
          <Reveal
            delay={0.1}
            className="glass glow-border flex h-[600px] flex-col overflow-hidden rounded-3xl shadow-2xl shadow-violet/10 lg:order-2"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet text-void">
                  <Bot className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Nidhi&apos;s AI agent</p>
                  <p className="flex items-center gap-1.5 font-mono text-[10.5px] text-muted">
                    <span
                      className={`size-1.5 rounded-full ${
                        agentStatus === null ? "bg-muted" : offline ? "bg-fuchsia" : "animate-pulse bg-emerald"
                      }`}
                    />
                    {agentStatus === null
                      ? "connecting…"
                      : offline
                        ? "offline"
                        : `online${agentStatus.model ? ` · ${agentStatus.model}` : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {remaining !== null && (
                  <span className="hidden font-mono text-[10.5px] text-muted sm:inline">
                    {remaining} question{remaining === 1 ? "" : "s"} left today
                  </span>
                )}
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    aria-label="Start a new conversation"
                    title="New conversation"
                    className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:border-cyan/40 hover:text-cyan"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-5 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="flex h-full flex-col justify-center">
                  <p className="font-display text-xl font-semibold">Hi, I&apos;m Nidhi&apos;s AI agent 👋</p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                    I answer questions about her experience, projects and skills, using real data from this portfolio.
                    Pick a question or type your own.
                  </p>
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {starters.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        disabled={offline}
                        className="group flex items-start gap-2 rounded-xl border border-line bg-white/3 px-3.5 py-3 text-left text-sm text-ink/85 transition hover:border-cyan/50 hover:bg-cyan/5 disabled:opacity-50"
                      >
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-cyan" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <Message key={m.id} message={m} />
              ))}

              {status === "submitted" && (
                <div className="flex items-center gap-2 pl-10 font-mono text-[11px] text-muted">
                  <Loader2 className="size-3 animate-spin text-cyan" /> thinking…
                </div>
              )}

              <AnimatePresence>
                {showFollowUps && nextQuestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-2 pl-10"
                  >
                    {nextQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="rounded-full border border-line px-3 py-1.5 text-xs text-ink/80 transition hover:border-cyan/50 hover:text-cyan"
                      >
                        {q}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-fuchsia/30 bg-fuchsia/10 px-4 py-3 text-sm text-fuchsia">
                  <span>{errorText(error)}</span>
                  {!error.message.includes("rate_limited") && !error.message.includes("offline") && (
                    <button
                      onClick={() => {
                        clearError();
                        regenerate();
                      }}
                      className="rounded-lg border border-fuchsia/40 px-3 py-1 text-xs font-medium transition hover:bg-fuchsia/10"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-line p-3"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-line bg-void/50 py-1.5 pr-1.5 pl-4 transition focus-within:border-cyan/50">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={MAX_CHARS}
                  disabled={offline || outOfQuestions}
                  placeholder={
                    offline
                      ? "The agent is offline right now"
                      : outOfQuestions
                        ? "Question limit reached, come back later"
                        : "Ask about her agents, stack, experience…"
                  }
                  aria-label="Ask Nidhi's AI agent"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted disabled:cursor-not-allowed"
                />
                {input.length > MAX_CHARS - 100 && (
                  <span className="font-mono text-[10.5px] text-muted">
                    {input.length}/{MAX_CHARS}
                  </span>
                )}
                {busy ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Stop generating"
                    className="grid size-9 place-items-center rounded-xl border border-line text-muted transition hover:text-ink"
                  >
                    <Square className="size-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || offline || outOfQuestions}
                    aria-label="Send"
                    className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet text-void transition enabled:hover:scale-105 disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 px-1 text-[10.5px] text-muted">
                Answers are AI-generated from this portfolio. For anything else, email{" "}
                <a href={`mailto:${profile.email}`} className="text-ink/80 underline-offset-2 hover:underline">
                  {profile.email}
                </a>
                .
              </p>
            </form>
          </Reveal>

          {/* How it works + guardrails */}
          <Reveal className="glass rounded-3xl p-6 lg:order-1">
            <p className="mb-5 flex items-center gap-2 font-mono text-xs tracking-widest text-cyan uppercase">
              <Cpu className="size-4" /> How it works
            </p>
            <ol className="relative space-y-4">
              <span className="absolute top-2 bottom-2 left-[11px] w-px bg-gradient-to-b from-cyan via-violet to-fuchsia opacity-50" />
              {pipeline.map((step, i) => (
                <li key={step.label} className="relative flex gap-4">
                  <span className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full border border-cyan/50 bg-void font-mono text-[10px] text-cyan">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.label}</p>
                    <p className="font-mono text-[11px] text-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-7 mb-3 flex items-center gap-2 border-t border-line pt-6 font-mono text-xs tracking-widest text-cyan uppercase">
              <ShieldCheck className="size-4" /> Guardrails
            </p>
            <ul className="space-y-3">
              {guardrails.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-emerald" />
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
