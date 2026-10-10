
import axios from 'axios';

async function verifyLive() {
    console.log("--- TESTING LIVE GEMINI CONNECTION ---");
    try {
        const response = await axios.post('http://localhost:5000/api/ai/generate-blog-title', {
            category: "Science",
            keyword: "Quantum Physics"
        });
        console.log("SUCCESS:", response.data);
    } catch (error) {
        if (error.response) {
            console.log("❌ FAIL STATUS:", error.response.status);
            console.log("❌ FAIL DATA:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("❌ FAIL CONNECTION:", error.message);
        }
    }
}

verifyLive();
