
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("--- CHECKING AVAILABLE GEMINI MODELS ---");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await axios.get(url);
        console.log("✅ Models Found:");
        const models = response.data.models || [];

        models.forEach(m => {
            if (m.name.includes("gemini")) {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods})`);
            }
        });

        // Filter for generateContent support
        const contentModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        if (contentModels.length > 0) {
            console.log("\nRECOMMENDED MODELS:");
            contentModels.forEach(m => console.log(`> ${m.name.replace('models/', '')}`));
        } else {
            console.log("\n❌ NO MODELS SUPPORT 'generateContent'");
        }

    } catch (error) {
        if (error.response) {
            console.log("❌ Error fetching models:", error.response.status, error.response.data);
        } else {
            console.log("❌ Connection Error:", error.message);
        }
    }
}

listModels();
