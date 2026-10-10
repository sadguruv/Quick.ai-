import "dotenv/config";

// CONFIGURATION
const OLLAMA_BASE_URL = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434";
const PREFERRED_MODELS = [
    process.env.OLLAMA_MODEL,
    "llama3.2:latest",
    "llama3.2",
    "qwen2.5:7b",
    "llama3:latest",
    "llama3",
    "mistral:latest",
    "mistral"
].filter(Boolean);

let detectedModel = null;

/**
 * Detect the best available installed Ollama model
 */
export async function getAvailableOllamaModel() {
    if (detectedModel) return detectedModel;

    try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });
        if (res.ok) {
            const data = await res.json();
            const installed = (data.models || []).map(m => m.name.toLowerCase());
            for (const pref of PREFERRED_MODELS) {
                const found = installed.find(m => m === pref.toLowerCase() || m.startsWith(pref.toLowerCase()));
                if (found) {
                    detectedModel = found;
                    console.log(`[AI Executor] Detected installed Ollama model: ${detectedModel}`);
                    return detectedModel;
                }
            }
            if (installed.length > 0) {
                detectedModel = installed[0];
                console.log(`[AI Executor] Using first available Ollama model: ${detectedModel}`);
                return detectedModel;
            }
        }
    } catch (e) {
        console.warn(`[AI Executor] Failed to fetch models from Ollama (${e.message}), defaulting to qwen2.5:7b`);
    }

    detectedModel = process.env.OLLAMA_MODEL || "qwen2.5:7b";
    return detectedModel;
}

/**
 * AI Executor Service
 * Centralized gateway for all Ollama text generation to ensure reliability and uniqueness.
 */
export const generateSafeText = async (prompt, systemInstruction = "", options = {}) => {
    const {
        temperature = 0.7,
        maxRetries = 2,
        numPredict = 350
    } = options;

    const activeModel = await getAvailableOllamaModel();
    let attempt = 0;

    const hardenedSystem = `
${systemInstruction}
CRITICAL INSTRUCTIONS:
- Do not reuse structure from previous responses.
- Vary tone, structure, and headings.
- Respond uniquely to this prompt only.
- Do not include "Here is the article" or meta-commentary.
- If you are analyzing a resume, provide a specific score and actionable feedback.
`.trim();

    while (attempt <= maxRetries) {
        attempt++;
        console.log(`[AI Executor] Attempt ${attempt} with Ollama model '${activeModel}'`);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 180000); // 180s Timeout for CPU generation

            const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: activeModel,
                    prompt: `${hardenedSystem}\n\nUser Request: ${prompt}`,
                    stream: false,
                    options: {
                        temperature: temperature,
                        num_predict: numPredict
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Ollama Error (${response.status}): ${errText || response.statusText}`);
            }

            const data = await response.json();
            const text = (data.response || "").trim();

            if (text.length > 0) {
                return text;
            }

            throw new Error("Empty response from Ollama");

        } catch (error) {
            console.error(`[AI Executor] Error on attempt ${attempt}:`, error.message);

            if (attempt <= maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            } else {
                throw error;
            }
        }
    }
};
