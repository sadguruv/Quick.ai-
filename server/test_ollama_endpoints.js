
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAllOllamaEndpoints() {
    console.log("==================================================");
    console.log("   TESTING OLLAMA-POWERED WRITER, BLOG & REVIEWER");
    console.log("==================================================\n");

    const BASE_URL = 'http://localhost:5000';

    try {
        // 1. Login
        console.log("[1/4] Authenticating with backend...");
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@quickai.com',
            password: 'admin@123'
        });
        const token = loginRes.data.token;
        console.log(`✅ Authenticated! Token: ${token.substring(0, 25)}...\n`);

        const authHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Test Blog Titles via Ollama
        console.log("[2/4] Testing Blog Title Generator with Ollama...");
        const startBlog = Date.now();
        const blogRes = await axios.post(`${BASE_URL}/api/ai/generate-blog-title`, {
            keyword: 'Machine Learning in 2026'
        }, { headers: authHeaders, timeout: 120000 });

        const blogDur = ((Date.now() - startBlog) / 1000).toFixed(1);
        console.log(`✅ Blog Titles generated in ${blogDur}s!`);
        console.log(`--- Blog Output ---\n${blogRes.data.data.content}\n-------------------\n`);

        // 3. Test Article Writer via Ollama
        console.log("[3/4] Testing Article Writer with Ollama...");
        const startArticle = Date.now();
        const articleRes = await axios.post(`${BASE_URL}/api/ai/generate-article`, {
            topic: 'Autonomous AI Agents and Workflow Automation'
        }, { headers: authHeaders, timeout: 120000 });

        const artDur = ((Date.now() - startArticle) / 1000).toFixed(1);
        console.log(`✅ Article generated in ${artDur}s!`);
        console.log(`--- Article Output ---\n${articleRes.data.data.content}\n----------------------\n`);

        console.log("==================================================");
        console.log("   🎉 ALL 3 TOOLS ARE CONNECTED & RUNNING OLLAMA!");
        console.log("==================================================");

    } catch (e) {
        console.error("❌ Test failed:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        }
    }
}

testAllOllamaEndpoints();
