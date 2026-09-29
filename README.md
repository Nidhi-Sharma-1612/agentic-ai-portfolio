# Nidhi Sharma — AI Engineer Portfolio

Personal portfolio for AI Engineer / Agentic AI Engineer / Full Stack AI Engineer roles.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Three.js (React Three Fiber) · Framer Motion · lucide-react · Vercel AI SDK

## Highlights

- **3D agent graph hero**: an LLM core wired to Planner, Tools, Memory, RAG, Vector DB and other nodes, with data pulses, bloom and cursor parallax. It falls back to a lighter scene on mobile, on low-power devices and when reduced motion is requested.
- **"Ask my agent"**: a real tool-calling chatbot. `app/api/chat/route.ts` streams from an LLM that calls typed Zod tools (`getProjects`, `getSkills`, …) over `lib/data.ts`, and the UI shows each tool call live. It includes per-IP rate limiting and input limits.
- **The Stack**: skills laid out as the layers of an AI application's architecture.
- Timeline experience, filterable project cards with architecture flows, a ⌘K command palette, generated OG image, JSON-LD, sitemap and robots.

## Editing content

All content lives in **`lib/data.ts`**. The UI and the chatbot both read from it.

- Photo: `public/profile-photo.jpeg`
- Resume: `public/resume.pdf`
- Project links: set `github` / `demo` on each entry in `projects`

## Run locally

```bash
npm install
cp .env.example .env.local   # add an API key (see below)
npm run dev                  # http://localhost:3000
```

### Chatbot API key

| `AI_PROVIDER`      | Key                                                                                 | Default model      | Cost          |
| ------------------ | ----------------------------------------------------------------------------------- | ------------------ | ------------- |
| `google` (default) | `GOOGLE_GENERATIVE_AI_API_KEY` from [AI Studio](https://aistudio.google.com/apikey) | `gemini-2.5-flash` | Free tier     |
| `anthropic`        | `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com)     | `claude-haiku-4-5` | Pay-as-you-go |
| `openai`           | `OPENAI_API_KEY`                                                                    | `gpt-4o-mini`      | Pay-as-you-go |

Without a key the site still works. The chat shows a friendly "agent offline" message.
Note: a claude.ai Pro/Max subscription does **not** include API access.

### Chat security & guardrails

Every request to `/api/chat` passes these layers, cheapest first:

1. **Origin check:** only browser requests from this site are accepted (`NEXT_PUBLIC_SITE_URL`).
2. **Request validation:** JSON only, 32 KB max, schema-checked with Zod.
3. **Rate limits:** 5/minute and 40/day per visitor, plus 800/day across all visitors (`CHAT_LIMIT_*`). Set `UPSTASH_REDIS_REST_URL`/`TOKEN` so limits are shared across serverless instances; otherwise they're in-memory per instance.
4. **History sanitizing:** only plain text is kept (max 500 chars per question, last 10 messages). Client-sent tool results and system messages are rejected, so they can't be forged.
5. **Prompt-injection screen:** a regex check answers attempts like "ignore previous instructions" with a canned reply, with no LLM call.
6. **Topic classifier:** a small LLM call declines anything not about Nidhi (general knowledge, coding help, other people) with a canned reply.
7. **Agent instructions:** strict scope, tool-grounded facts only, and tool output treated as data.

`lib/guardrails.ts` holds the guardrails, `lib/rate-limit.ts` the limits, and `app/api/chat/route.ts` wires them together. Site-wide security headers are set in `next.config.ts`.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import it at [vercel.com/new](https://vercel.com/new). The framework is auto-detected.
3. In **Settings → Environment Variables**, add `AI_PROVIDER`, the matching API key, and `NEXT_PUBLIC_SITE_URL` (your final URL).
4. Deploy, then redeploy after changing any env var.
