/**
 * Modular AI Provider Configuration
 * Supports multiple AI providers via environment variables
 * No hardcoded provider lock-in
 */

const AI_PROVIDER = (process.env.AI_PROVIDER || "openai").toLowerCase();

const PROVIDER_CONFIGS = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    defaultModel: process.env.OPENAI_MODEL || "gpt-4",
    clientClass: "OpenAI",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
    defaultModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    clientClass: "OpenAI", // Gemini uses OpenAI-compatible API
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1",
    defaultModel: process.env.ANTHROPIC_MODEL || "claude-3-opus-20240229",
    clientClass: "Anthropic",
  },
};

export const getAIProviderConfig = () => {
  const config = PROVIDER_CONFIGS[AI_PROVIDER];
  
  if (!config) {
    throw new Error(
      `Invalid AI_PROVIDER: ${AI_PROVIDER}. Supported: ${Object.keys(PROVIDER_CONFIGS).join(", ")}`
    );
  }

  if (!config.apiKey) {
    console.warn(`⚠️  ${AI_PROVIDER.toUpperCase()}_API_KEY not set. AI features will use mock mode.`);
  }

  return {
    provider: AI_PROVIDER,
    ...config,
  };
};

export const isMockMode = () => {
  const config = getAIProviderConfig();
  return !config.apiKey || config.apiKey.includes("your-") || config.apiKey.includes("sk-...");
};

export default getAIProviderConfig;
