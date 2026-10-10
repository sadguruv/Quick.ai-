
import fetch from "node-fetch";

const OLLAMA_URL = "http://localhost:11434";
const SD_URL = "http://127.0.0.1:7860";

const checkOllama = async () => {
    try {
        const res = await fetch(`${OLLAMA_URL}/api/tags`);
        if (res.ok) {
            const data = await res.json();
            const hasModel = data.models.some(m => m.name.includes("qwen"));
            if (hasModel) console.log("✅ Ollama is RUNNING and qwen2.5:7b is available.");
            else console.log("⚠️ Ollama is RUNNING but qwen2.5:7b NOT found. Run `ollama pull qwen2.5:7b`.");
        }
        else console.log("❌ Ollama detected but returned error: " + res.status);
    } catch (e) {
        console.log("❌ Ollama is NOT reachable. Run `ollama serve`.");
    }
};

const checkSD = async () => {
    try {
        const res = await fetch(`${SD_URL}/sdapi/v1/options`);
        if (res.ok) console.log("✅ Local Stable Diffusion is RUNNING.");
        else console.log("❌ Local SD detected but returned error: " + res.status);
    } catch (e) {
        console.log("❌ Local Stable Diffusion is NOT reachable. Run `./webui.bat --api`.");
    }
};

(async () => {
    console.log("--- Testing Local AI Connections ---");
    await checkOllama();
    await checkSD();
    console.log("------------------------------------");
})();
