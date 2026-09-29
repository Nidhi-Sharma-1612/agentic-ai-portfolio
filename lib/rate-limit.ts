import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Three tiers protect each public endpoint (and the bills behind them):
//   burst  – per IP, stops rapid-fire spamming
//   daily  – per IP, caps one visitor's total usage
//   global – all visitors, caps total daily usage
// With UPSTASH_REDIS_REST_URL/TOKEN set, limits are shared across all serverless
// instances. Without them, an in-memory sliding window is used per instance.

const env = (name: string, fallback: number) => Number(process.env[name]) || fallback;
const MIN = 60_000;
const DAY = 86_400_000;

type TierConfig = { limit: number; windowMs: number; window: `${number} ${"m" | "d"}` };
type Tier = "burst" | "daily" | "global";

const SCOPES = {
  chat: {
    burst: { limit: env("CHAT_LIMIT_PER_MINUTE", 5), windowMs: MIN, window: "1 m" },
    daily: { limit: env("CHAT_LIMIT_PER_DAY", 40), windowMs: DAY, window: "1 d" },
    global: { limit: env("CHAT_LIMIT_GLOBAL_PER_DAY", 800), windowMs: DAY, window: "1 d" },
  },
  contact: {
    burst: { limit: 2, windowMs: 10 * MIN, window: "10 m" },
    daily: { limit: 5, windowMs: DAY, window: "1 d" },
    global: { limit: 100, windowMs: DAY, window: "1 d" },
  },
} satisfies Record<string, Record<Tier, TierConfig>>;
export type Scope = keyof typeof SCOPES;
const TIERS: Tier[] = ["burst", "daily", "global"];

export type LimitResult = { ok: boolean; remaining: number; retryAfter: number; tier?: Tier };

// --- Upstash (distributed) --------------------------------------------------

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;
const limiters = new Map<string, Ratelimit>();

function upstashLimiter(scope: Scope, tier: Tier) {
  const key = `${scope}:${tier}`;
  let limiter = limiters.get(key);
  if (!limiter && redis) {
    const { limit, window } = SCOPES[scope][tier];
    limiter = new Ratelimit({ redis, prefix: `portfolio-${key}`, limiter: Ratelimit.slidingWindow(limit, window) });
    limiters.set(key, limiter);
  }
  return limiter;
}

// --- In-memory fallback (per instance) --------------------------------------

const logs = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (logs.get(key) ?? []).filter((t) => t > now - windowMs);
  const ok = recent.length < limit;
  if (ok) recent.push(now);
  logs.set(key, recent);
  if (logs.size > 10_000) {
    for (const [k, v] of logs) if (!v.some((t) => t > now - DAY)) logs.delete(k);
  }
  const retryAfter = ok ? 0 : Math.ceil((recent[0] + windowMs - now) / 1000);
  return { ok, remaining: Math.max(limit - recent.length, 0), retryAfter };
}

// ----------------------------------------------------------------------------

/** Checks every tier for a scope; the first one exceeded wins. `remaining` is today's per-IP allowance. */
export async function rateLimit(ip: string, scope: Scope = "chat"): Promise<LimitResult> {
  const tiers = SCOPES[scope];
  let remaining = tiers.daily.limit;

  for (const tier of TIERS) {
    const { limit, windowMs } = tiers[tier];
    const id = tier === "global" ? "all" : `ip:${ip}`;
    const limiter = upstashLimiter(scope, tier);
    let result: { ok: boolean; remaining: number; retryAfter: number };
    if (limiter) {
      const r = await limiter.limit(id);
      result = { ok: r.success, remaining: r.remaining, retryAfter: Math.ceil((r.reset - Date.now()) / 1000) };
    } else {
      result = memoryLimit(`${scope}:${tier}:${id}`, limit, windowMs);
    }
    if (!result.ok) return { ok: false, remaining: 0, retryAfter: Math.max(result.retryAfter, 1), tier };
    if (tier === "daily") remaining = result.remaining;
  }
  return { ok: true, remaining, retryAfter: 0 };
}

/** Client IP as seen by the platform's proxy (Vercel sets x-real-ip / x-forwarded-for). */
export function clientIp(req: Request) {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Only accept browser requests from this site, so other origins can't use our endpoints. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([new URL(req.url).host, req.headers.get("host")]);
  if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
  try {
    return allowed.has(new URL(origin).host);
  } catch {
    return false;
  }
}
