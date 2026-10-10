
import axios from 'axios';

async function testOllama() {
    console.log("Testing Ollama Direct Connection...");
    const url = "http://localhost:11434/api/generate";

    try {
        console.log(`Sending request to ${url} for model 'qwen2.5:7b'...`);
        const start = Date.now();

        const res = await axios.post(url, {
            model: "qwen2.5:7b",
            prompt: "Say hello",
            stream: false
        }, {
            timeout: 120000 // 120s
        });

        const duration = (Date.now() - start) / 1000;
        console.log(`✅ Success in ${duration}s`);
        console.log("Response:", res.data.response);

    } catch (e) {
        const duration = (Date.now() - start) / 1000;
        console.log(`❌ Failed in ${duration}s`);
        if (e.response) {
            console.log("Status:", e.response.status);
            console.log("Data:", e.response.data);
        } else {
            console.log("Error:", e.message);
        }
    }
}

testOllama();
