
import "dotenv/config";
import axios from "axios";
// import fetch from "node-fetch";

// --- Configuration ---
// Defaults for Local AI
const OLLAMA_URL = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434";
// Fix: Default to 7861 to match running SD instance if env is missing
const SD_URL = process.env.SD_API_URL || "http://127.0.0.1:7860";
console.log(`[AI Providers] Config - SD_URL: ${SD_URL}`); // Debug Log
const DEFAULT_MODEL = "qwen2.5:7b"; // User Mandatory Model

// --- Helpers ---

const trimToWordCount = (text, maxWords) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
};

const trimToLineCount = (text, maxLines) => {
    if (!text) return "";
    const lines = text.trim().split("\n").filter(line => line.trim().length > 0);
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join("\n");
};

/**
 * Text Generation using Ollama (Local)
 * REPLACED BY: server/utils/aiExecutor.js
 * This function is deprecated and removed to prevent usage.
 */

/**
 * Image Generation using Local Stable Diffusion (Automatic1111)
 */
/**
 * Image Generation using Pollinations.ai (Free Fallback)
 * Replaces Local SD to remove dependency on Port 7860.
 */
import sharp from "sharp";

/**
 * Image Generation using Pollinations.ai (Free Fallback)
 * Replaces Local SD to remove dependency on Port 7860.
 */
export const generateImageFromText = async (prompt) => {
    // Pollinations.ai is a free, URL-based generation service.
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true`;

    console.log(`Generating image via Pollinations.ai for prompt: "${prompt.substring(0, 20)}..."`);

    let buffer = null;

    try {
        // Try Pollinations with native fetch
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Pollinations 502/Error: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);

        // Verify it is an image
        if (!buffer || buffer.length < 1000) throw new Error("Invalid image data received");

        // --- WATERMARK REPLACEMENT LOGIC V2 ---
        // 1. Process with Sharp
        let image = sharp(buffer);
        const metadata = await image.metadata();
        const { width, height } = metadata;

        // 2. Crop the bottom 8% (Pollinations bar)
        const cropHeight = Math.floor(height * 0.92);

        image = image.extract({ left: 0, top: 0, width: width, height: cropHeight });

        // 3. Add "Quick.ai" Watermark
        const fontSize = Math.floor(width * 0.035);
        const padding = 20;

        const svgWatermark = `
            <svg width="${width}" height="${cropHeight}">
                <style>
                    .title { 
                        fill: rgba(255, 255, 255, 0.65); 
                        font-size: ${fontSize}px; 
                        font-weight: bold; 
                        font-family: sans-serif; 
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.8); 
                    }
                </style>
                <text x="${width - padding}" y="${cropHeight - padding}" text-anchor="end" class="title">Quick.ai</text>
            </svg>
        `;

        image = image.composite([
            {
                input: Buffer.from(svgWatermark),
                gravity: 'southeast'
            }
        ]);

        const processedBuffer = await image.toBuffer();
        return `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    } catch (error) {
        console.error("Pollinations.ai / Processing Error:", error.message);

        // FALLBACK: Return Semantic Image via LoremFlickr
        console.log("Using Fallback: LoremFlickr (Semantic)");
        try {
            // Extract a relevant keyword from the prompt for better matching
            // 1. Priority Subjects (Check these first)
            const prioritySubjects = ['husky', 'dog', 'cat', 'wolf', 'tiger', 'lion', 'bird', 'car', 'man', 'woman', 'person', 'robot', 'cyberpunk', 'landscape', 'mountain', 'ocean', 'city'];
            const promptLower = prompt.toLowerCase();
            let keyword = prioritySubjects.find(s => promptLower.includes(s));

            if (!keyword) {
                // 2. Standard Filter (Ignore adjectives/common words)
                const stopWords = [
                    'a', 'an', 'the', 'in', 'on', 'at', 'with', 'and', 'or', 'of', 'for', 'to', 'is', 'are',
                    'big', 'small', 'portrait', 'style', 'realistic', 'cartoon', 'pixel', 'render',
                    'playful', 'cute', 'cheerful', 'colorful', 'bright', 'background', 'design', 'illustration',
                    'majestic', 'glowing', 'standing', 'fantasy', 'art', 'snowy'
                ];
                const words = promptLower.replace(/[^a-z0-9 ]/g, '').split(' ');
                keyword = words.find(w => !stopWords.includes(w) && w.length > 2) || 'abstract';
            }

            console.log(`Fallback Keyword: "${keyword}"`);

            const fallbackUrl = `https://loremflickr.com/1024/1024/${encodeURIComponent(keyword)}/all`;
            const fbRes = await fetch(fallbackUrl);

            // LoremFlickr might redirect, fetch handles this.
            const fbBuf = await fbRes.arrayBuffer();
            const b64 = Buffer.from(fbBuf).toString('base64');
            return `data:image/jpeg;base64,${b64}`;
        } catch (fbError) {
            console.error("Fallback Error:", fbError.message);
            // Ultimate Fallback
            const fallbackUrl = `https://placehold.co/1024x1024/png?text=AI+Busy`;
            const fbRes2 = await fetch(fallbackUrl);
            const fbBuf2 = await fbRes2.arrayBuffer();
            const b64_2 = Buffer.from(fbBuf2).toString('base64');
            return `data:image/png;base64,${b64_2}`;
        }
    }
};

/**
 * Object Removal (Fallback for now)
 */

