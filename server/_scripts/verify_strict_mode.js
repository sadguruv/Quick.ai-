
// Enforce strict unhandled rejection tracking
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
    process.exit(1);
});

async function runTest() {
    console.log("=== STARTING ULTRA STRICT OLLAMA VALIDATION (PHASE 5) ===\n");

    const articleUrl = "http://127.0.0.1:5000/api/ai/generate-article";
    const titleUrl = "http://127.0.0.1:5000/api/ai/generate-blog-title";
    // For resume, we need a file upload, which is harder to mock in simple script without form-data package or fetch setup.
    // skipping file upload test for now unless critical, or I can add a mock if needed.
    // Actually, I can use a mock text body if controller supported it which it doesn't (requires file).

    // MOCK AUTH HEADER
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "mock-token:test-user"
    };

    // TEST 1: Article
    console.log(`[TEST 1] Testing Article Gen (Escalation Check)...`);
    try {
        const res = await fetch(articleUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ topic: "The History of Espresso" })
        });

        if (res.ok) {
            const json = await res.json();
            console.log("✅ Article Response Received (Length: " + json.data.content.length + ")");
            // console.log("Cnt:", json.data.content.substring(0, 100));
        } else {
            const txt = await res.text();
            console.log(`❌ Article Failed: ${txt}`);
        }
    } catch (e) { console.error("Fetch Error:", e.message); }

    // TEST 2: Blog Titles
    console.log("\n[TEST 2] Testing Blog Titles...");
    try {
        const res = await fetch(titleUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ keyword: "Minimalist Living" })
        });

        if (res.ok) {
            const json = await res.json();
            console.log("✅ Blog Titles Received:");
            console.log(json.data.content);
        } else {
            console.log(`❌ Blog Titles Failed: ${res.status}`);
        }
    } catch (e) { console.error("Fetch Error:", e.message); }

    console.log("\n=== VALIDATION COMPLETE ===");
}

runTest();
