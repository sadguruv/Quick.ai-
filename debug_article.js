
import axios from 'axios';

async function debugArticle() {
    console.log("Debugging Article Writer...");
    let start = Date.now();

    // Only check port 5000 since we verified server is there
    const ports = [5000];

    for (const port of ports) {
        const url = `http://localhost:${port}/api/ai/generate-article`;
        console.log(`\nTrying Port ${port} (${url})...`);
        start = Date.now();

        try {
            const res = await axios.post(url, {
                topic: "Benefits of drinking water"
            }, {
                timeout: 70000 // 70s timeout
            });

            const duration = (Date.now() - start) / 1000;
            console.log(`✅ Success in ${duration}s on Port ${port}`);
            console.log("Content:", res.data.data.content);
            console.log("Word Count:", res.data.data.content.split(/\s+/).length);
            return; // Success, exit

        } catch (e) {
            const duration = (Date.now() - start) / 1000;
            console.log(`❌ Failed on Port ${port} in ${duration}s`);
            if (e.response) {
                console.log("Status:", e.response.status);
                console.log("Data:", JSON.stringify(e.response.data, null, 2));
                console.log("Headers:", JSON.stringify(e.response.headers, null, 2));
            } else {
                console.log("Error:", e.message);
            }
        }
    }
}

debugArticle();
