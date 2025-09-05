import OpenAI from "openai";

// Docs: Using OpenRouter with the OpenAI SDK
// https://openrouter.ai/docs/community/open-ai-sdk

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

if (!OPENROUTER_API_KEY) {
  // Intentionally not throwing to avoid build-time failure in environments
  // where serverless envs are not set yet. Runtime calls will fail clearly.
  console.warn(
    "Missing OPENROUTER_API_KEY. Set it in your environment to enable AI analysis.",
  );
}

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    // Optional, but recommended: app attribution and referer
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "WorldCat",
  },
});

export function getOpenRouterModel(): string {
  return OPENROUTER_MODEL;
}


