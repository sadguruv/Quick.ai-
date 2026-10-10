import axios from "axios";

// Config - Hardcoded to standard SD port as per requirements
const SD_API_URL = process.env.SD_API_URL || "http://127.0.0.1:7860";

/**
 * Service to interact with AUTOMATIC1111 Stable Diffusion WebUI API.
 * STRICTLY ISOLATED from other AI services.
 */
export const generateImageService = async (prompt) => {
    const endpoint = `${SD_API_URL}/sdapi/v1/txt2img`;

    const payload = {
        prompt: prompt,
        negative_prompt: "blurry, bad quality, watermark, text, signature",
        steps: 25,
        width: 512,
        height: 512,
        cfg_scale: 7,
        sampler_name: "Euler a",
        batch_size: 1,
    };

    try {
        console.log(`[SD Service] Sending request to ${endpoint}`);
        const response = await axios.post(endpoint, payload, {
            timeout: 900000 // 15 Minutes for CPU
        });

        const data = response.data;

        if (!data.images || data.images.length === 0) {
            throw new Error("No images returned from Stable Diffusion.");
        }

        // AUTOMATIC1111 returns base64 strings in the 'images' array
        return data.images[0];
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            throw new Error("Stable Diffusion WebUI is not running or unreachable at " + SD_API_URL);
        }
        throw error;
    }
};
