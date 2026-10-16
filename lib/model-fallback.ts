import type { google } from "@ai-sdk/google";
import { wrapLanguageModel } from "ai";

// The v4 model type all three providers (Google, Anthropic, OpenAI) return.
type Model = ReturnType<typeof google>;

/** Quota / overload errors from the provider (HTTP 429 or 503). */
function isOverloaded(error: unknown) {
  const e = error as { statusCode?: number; message?: string };
  return (
    e?.statusCode === 429 ||
    e?.statusCode === 503 ||
    /quota|rate.?limit|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(e?.message ?? "")
  );
}

/**
 * Uses `primary`, but if the provider rejects the call for quota or overload
 * reasons, answers the same request with `fallback` instead. On Gemini's free
 * tier each model has its own quota, so a lite fallback keeps the chat working
 * when the main model is busy.
 */
export function withFallback(primary: Model, fallback: Model) {
  return wrapLanguageModel({
    model: primary,
    middleware: {
      specificationVersion: "v4",
      wrapGenerate: async ({ doGenerate, params }) => {
        try {
          return await doGenerate();
        } catch (error) {
          if (!isOverloaded(error)) throw error;
          return fallback.doGenerate(params);
        }
      },
      wrapStream: async ({ doStream, params }) => {
        try {
          return await doStream();
        } catch (error) {
          if (!isOverloaded(error)) throw error;
          return fallback.doStream(params);
        }
      },
    },
  });
}
