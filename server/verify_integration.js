
import axios from "axios";

const SERVICES = [
    { name: "Ollama", url: "http://127.0.0.1:11434/api/tags", expectedStatus: 200 },
    { name: "Rembg", url: "http://127.0.0.1:7000/docs", expectedStatus: 200 },
    { name: "Stable Diffusion", url: "http://127.0.0.1:7860/docs", expectedStatus: 200 },

    { name: "QuickAI Backend", url: "http://localhost:5000/", expectedStatus: 200 }
];

const checkService = async (service) => {
    try {
        console.log(`Checking ${service.name}...`);
        const response = await axios.get(service.url, { timeout: 2000 });
        if (response.status === service.expectedStatus) {
            console.log(`✅ ${service.name} is ONLINE`);
            return true;
        } else {
            console.warn(`⚠️  ${service.name} returned status ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ ${service.name} is OFFLINE or Unreachable (${error.message})`);
        return false;
    }
};

const runVerification = async () => {
    console.log("========================================");
    console.log("   QuickAI Integration Verification");
    console.log("========================================");

    let allPass = true;
    for (const service of SERVICES) {
        const passed = await checkService(service);
        if (!passed) allPass = false;
    }

    console.log("========================================");
    if (allPass) {
        console.log("🚀 ALL SYSTEMS GO! Integration Successful.");
    } else {
        console.log("⚠️  SOME SERVICES FAILED. Please check startup logs.");
    }
};

runVerification();
