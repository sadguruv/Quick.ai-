// import fetch from "node-fetch"; // Using Native Node Fetch

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "qwen2.5:7b"; // you can change later safely

export async function runAI(prompt) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s Strict Timeout

    console.log(`[Engine] Fetching from ${OLLAMA_URL}...`);
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        // keep_alive: -1, // Removed to fix blocking issue
        options: {
          num_ctx: 1024, // Reduced for speed/stability
          num_predict: 512, // Limit output length
          temperature: 0.7
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`AI Engine Error (${res.status}):`, errorText);
      throw new Error(`AI engine unavailable: ${res.statusText}`);
    }

    const data = await res.json();
    return data.response.trim();
  } catch (error) {
    console.error("AI Engine Connection Failed:", error.message);
    throw error;
  }
}
