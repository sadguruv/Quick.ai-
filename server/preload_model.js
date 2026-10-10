
import fetch from "node-fetch";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "qwen2.5:7b";

async function preload() {
    console.log(`[Startup] Pre-loading Ollama Model: ${MODEL}...`);
    try {
        // We send an empty prompt with keep_alive to load it into RAM
        const res = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: MODEL,
                prompt: "",
                keep_alive: -1 // Stay loaded forever
            })
        });

        if (res.ok) {
            console.log(`[Startup] Model ${MODEL} loaded and ready! 🚀`);
        } else {
            console.warn(`[Startup] Failed to preload model: ${res.statusText}`);
        }
    } catch (e) {
        console.error(`[Startup] specific error: ${e.message}. Is Ollama running?`);
    }
}

preload();
