
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000/api/ai';
const PDF_PATH = 'recovery_check.pdf';
if (!fs.existsSync(PDF_PATH)) fs.writeFileSync(PDF_PATH, '%PDF-1.4\n%Simple PDF Content');

async function testTool(name, payload, type = 'json') {
    console.log(`\n--- TESTING ${name} ---`);
    try {
        let response;
        if (type === 'multipart') {
            response = await axios.post(`${BASE_URL}/${payload.endpoint}`, payload.data, { headers: payload.data.getHeaders() });
        } else {
            response = await axios.post(`${BASE_URL}/${payload.endpoint}`, payload.body);
        }

        console.log(`✅ Status: ${response.status}`);
        if (response.data.content) {
            console.log(`📝 Content Preview: ${response.data.content.substring(0, 100).replace(/\n/g, ' ')}...`);
            if (response.data.content.includes("mock") || response.data.content.includes("Placeholder")) {
                console.error("❌ FAILURE: Detected Mock/Placeholder content!");
            }
        } else {
            console.log("⚠️ No content field returned.");
        }
        return true;
    } catch (error) {
        if (error.response) {
            console.log(`ℹ️ Response: ${error.response.status} - ${error.response.data.message}`);
            // 400 is acceptable for Image tools (Missing Key), but NOT for Text tools (Gemini Key is set)
            if (name.includes("Image") || name.includes("Remove")) {
                return true;
            }
            return false;
        } else {
            console.error(`❌ Connection Error: ${error.message}`);
            return false;
        }
    }
}

async function runSuite() {
    // 1. Blog Title
    await testTool("Blog Title", { endpoint: "generate-blog-title", body: { keyword: "Space Exploration" } });

    // 2. Write Article
    await testTool("Write Article", { endpoint: "generate-article", body: { topic: "Benefits of Green Tea" } });

    // 3. Resume Review
    const form = new FormData();
    form.append("resume", fs.createReadStream(PDF_PATH));
    await testTool("Resume Review", { endpoint: "resume-review", data: form }, 'multipart');

    console.log("\n--- SUITE COMPLETE ---");
}

runSuite();
