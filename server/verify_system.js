
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000/api/ai";
const MOCK_TOKEN = "mock-token:admin";

async function testEndpoint(name, url, method, body, isFormData = false) {
    console.log(`\nTesting ${name}...`);
    try {
        const headers = { 'Authorization': MOCK_TOKEN };
        if (!isFormData) headers['Content-Type'] = 'application/json';

        const options = {
            method,
            headers,
            body: isFormData ? body : JSON.stringify(body)
        };

        const start = Date.now();
        const res = await fetch(url, options);
        const duration = Date.now() - start;

        if (res.ok) {
            const data = await res.json();
            console.log(`✅ [PASS] ${name} (${duration}ms)`);
            console.log(`   Response Preview: ${typeof data.data?.content === 'string' ? data.data.content.substring(0, 50) + "..." : "Content Received"}`);
            return true;
        } else {
            console.error(`❌ [FAIL] ${name} - Status: ${res.status}`);
            console.error(await res.text());
            return false;
        }
    } catch (e) {
        console.error(`❌ [CRASH] ${name} - ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log("🚀 Starting System Verification...");

    // 1. Blog Titles
    await testEndpoint("Blog Titles", `${BASE_URL}/generate-blog-title`, "POST", {
        category: "Technology",
        keyword: "AI Reliability"
    });

    // 2. Article Writer
    await testEndpoint("Article Writer", `${BASE_URL}/generate-article`, "POST", {
        topic: "The Importance of Testing",
        length: "Short",
        tone: "Professional"
    });

    // 3. Resume Review
    // Create dummy PDF
    const dummyPdfPath = path.join(__dirname, "temp_test.pdf");
    fs.writeFileSync(dummyPdfPath, "Fake PDF Content");

    const form = new FormData();
    form.append("resume", fs.createReadStream(dummyPdfPath));

    await testEndpoint("Resume Review", `${BASE_URL}/resume-review`, "POST", form, true);

    // Cleanup
    try { fs.unlinkSync(dummyPdfPath); } catch (e) { }

    console.log("\n✨ Verification Complete.");
}

runTests();
