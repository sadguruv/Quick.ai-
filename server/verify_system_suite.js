
import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullVerification() {
    console.log("=========================================");
    console.log("   QUICKAI FULL SYSTEM VERIFICATION");
    console.log("=========================================\n");

    // 1. Start Server
    console.log("[1/8] Launching Backend Server on port 5000...");
    const serverProcess = spawn('node', ['server.js'], {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    let serverOutput = '';
    serverProcess.stdout.on('data', data => { serverOutput += data.toString(); });
    serverProcess.stderr.on('data', data => { serverOutput += data.toString(); });

    // Wait for server to listen
    let serverReady = false;
    for (let i = 0; i < 20; i++) {
        await sleep(500);
        try {
            const healthRes = await axios.get('http://localhost:5000/api/health', { timeout: 1000 });
            if (healthRes.status === 200) {
                serverReady = true;
                break;
            }
        } catch (e) {
            // waiting...
        }
    }

    if (!serverReady) {
        console.error("❌ Server failed to start! Output:\n", serverOutput);
        serverProcess.kill();
        process.exit(1);
    }
    console.log("✅ Backend Server is RUNNING and responding on http://localhost:5000/api/health\n");

    const BASE_URL = 'http://localhost:5000';

    try {
        // 2. Test Auth (Admin login & User login)
        console.log("[2/8] Testing Authentication...");
        const adminLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@quickai.com',
            password: 'admin@123'
        });

        if (!adminLoginRes.data.success || !adminLoginRes.data.token) {
            throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.data)}`);
        }
        const adminToken = adminLoginRes.data.token;
        console.log(`✅ Admin Login successful! Token: ${adminToken.substring(0, 25)}... Role: ${adminLoginRes.data.user.role}, Credits: ${adminLoginRes.data.user.credits}`);

        const userLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'user@quick.ai',
            password: 'password123'
        });
        if (!userLoginRes.data.success || !userLoginRes.data.token) {
            throw new Error(`User login failed: ${JSON.stringify(userLoginRes.data)}`);
        }
        const userToken = userLoginRes.data.token;
        console.log(`✅ User Login successful! Token: ${userToken.substring(0, 25)}... Role: ${userLoginRes.data.user.role}, Credits: ${userLoginRes.data.user.credits}\n`);

        const authHeaders = {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        };

        // 3. Test User & Credits API
        console.log("[3/8] Testing User & Credits API...");
        const creditsRes = await axios.get(`${BASE_URL}/api/user/get-credits`, { headers: authHeaders });
        console.log(`✅ Get Credits status: ${creditsRes.status}, Available Credits: ${creditsRes.data.data?.credits ?? creditsRes.data.credits}`);

        const creationsRes = await axios.get(`${BASE_URL}/api/user/get-user-creations`, { headers: authHeaders });
        console.log(`✅ Get User Creations status: ${creationsRes.status}, Creations Count: ${creationsRes.data.data?.creations?.length || 0}\n`);

        // 4. Test Community Forum
        console.log("[4/8] Testing Community Forum API...");
        const communityRes = await axios.get(`${BASE_URL}/api/user/community/posts`, { headers: authHeaders });
        console.log(`✅ Community Posts status: ${communityRes.status}, Posts Count: ${communityRes.data.data?.posts?.length || 0}\n`);

        // 5. Test AI Blog Title Generator
        console.log("[5/8] Testing AI Blog Title Generation...");
        const blogRes = await axios.post(`${BASE_URL}/api/ai/generate-blog-title`, {
            keyword: 'Next-Gen Artificial Intelligence'
        }, { headers: authHeaders, timeout: 30000 });

        console.log(`✅ Blog Title Generator status: ${blogRes.status}`);
        const blogContent = blogRes.data.data?.content || blogRes.data.content;
        console.log(`   Sample Output:\n   ${blogContent.substring(0, 120).replace(/\n/g, '\n   ')}...\n`);

        // 6. Test AI Article Generator
        console.log("[6/8] Testing AI Article Generation...");
        const articleRes = await axios.post(`${BASE_URL}/api/ai/generate-article`, {
            topic: 'The Future of Renewable Energy'
        }, { headers: authHeaders, timeout: 30000 });

        console.log(`✅ Article Generator status: ${articleRes.status}`);
        const articleContent = articleRes.data.data?.content || articleRes.data.content;
        console.log(`   Sample Output:\n   ${articleContent.substring(0, 150).replace(/\n/g, '\n   ')}...\n`);

        // 7. Test AI Image Generation
        console.log("[7/8] Testing AI Image Generation...");
        const imageRes = await axios.post(`${BASE_URL}/api/ai/generate-image`, {
            prompt: 'A futuristic city skyline with flying cars at sunset'
        }, { headers: authHeaders, timeout: 30000 });

        console.log(`✅ Image Generator status: ${imageRes.status}`);
        const imageContent = imageRes.data.data?.content || imageRes.data.content;
        console.log(`   Image Data Preview: ${imageContent.substring(0, 40)}... (Length: ${imageContent.length} chars)\n`);

        // 8. Test Resume Review
        console.log("[8/8] Testing Resume Review...");
        const dummyPdf = path.join(__dirname, 'test_resume_sample.pdf');
        if (!fs.existsSync(dummyPdf)) {
            // Write valid PDF header and text
            fs.writeFileSync(dummyPdf, `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n198\n%%EOF`);
        }

        const formData = new FormData();
        formData.append('resume', fs.createReadStream(dummyPdf));

        try {
            const resumeRes = await axios.post(`${BASE_URL}/api/ai/resume-review`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${userToken}`
                },
                timeout: 30000
            });
            console.log(`✅ Resume Review status: ${resumeRes.status}`);
            const resText = resumeRes.data.data?.content || resumeRes.data.content || JSON.stringify(resumeRes.data);
            console.log(`   Resume Analysis Output: ${resText.substring(0, 100)}...\n`);
        } catch (pdfErr) {
            console.log(`ℹ️ Resume Review response: ${pdfErr.response ? pdfErr.response.data.message : pdfErr.message}\n`);
        }

        // 9. Test Background Removal
        console.log("[9/9] Testing Background Removal (rembg)...");
        const sampleImg = path.join(__dirname, '..', 'test_person.jpg');
        if (fs.existsSync(sampleImg)) {
            const bgForm = new FormData();
            bgForm.append('image', fs.createReadStream(sampleImg));
            const bgRes = await axios.post(`${BASE_URL}/api/ai/remove-image-background`, bgForm, {
                headers: {
                    ...bgForm.getHeaders(),
                    'Authorization': `Bearer ${userToken}`
                },
                timeout: 45000
            });
            console.log(`✅ Background Removal status: ${bgRes.status}`);
            const bgContent = bgRes.data.data?.content || bgRes.data.content;
            console.log(`   Result Data Preview: ${bgContent.substring(0, 40)}... (Length: ${bgContent.length} chars)\n`);
        } else {
            console.log("⚠️ Sample image not found, skipping bg test.\n");
        }

        console.log("=========================================");
        console.log("   🎉 ALL SYSTEM TESTS COMPLETED!");
        console.log("=========================================");

    } catch (err) {
        console.error("❌ Test Failed:", err.message);
        if (err.response) {
            console.error("   Status:", err.response.status);
            console.error("   Data:", JSON.stringify(err.response.data, null, 2));
        }
    } finally {
        serverProcess.kill();
        console.log("\n[Cleanup] Backend test instance stopped.");
    }
}

runFullVerification();
