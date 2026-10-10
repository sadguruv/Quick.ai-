import fetch from "node-fetch";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "qwen2.5:7b";

console.log("Testing AI Engine...");
console.log(`URL: ${OLLAMA_URL}`);
console.log(`Model: ${MODEL}`);

async function test() {
    try {
        const res = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: MODEL,
                prompt: "Say Test",
                stream: false
            })
        });

        console.log(`Status: ${res.status}`);
        if (!res.ok) {
            console.log("Error Body:", await res.text());
        } else {
            const data = await res.json();
            console.log("Success Response:", data.response);
        }
    } catch (e) {
        console.error("Fetch Failed:", e.message);
    }
}

test();
