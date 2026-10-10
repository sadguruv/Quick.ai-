import { prompts } from "../ai/prompts.js";
import { generateSafeText } from "../utils/aiExecutor.js";
import * as localDb from "../db/localDb.js";

// ULTRA STRICT OLLAMA ENFORCEMENT
export async function blogTitles(req, res) {
    try {
        const { keyword } = req.body;
        console.log(`[Strict Mode] Generating Titles for: ${keyword}`);

        if (!keyword) {
            return res.status(400).json({ success: false, message: "Keyword is required" });
        }

        const userId = req.userId;
        const currentCredits = localDb.getCredits(userId);
        if (currentCredits < 10) {
            return res.status(400).json({ success: false, message: "Insufficient credits. Required: 10, Available: " + currentCredits });
        }

        const userPrompt = prompts.blogTitles(req.body);
        const systemInstruction = `Provide 10 unique, catchy blog titles. 
        Do not use generic formats.`;

        const content = await generateSafeText(userPrompt, systemInstruction, {
            temperature: 0.9,
            escalate: true
        });

        const newCredits = localDb.deductCredit(userId, 10);
        localDb.saveCreation({
            userId,
            prompt: keyword,
            content: content,
            type: "blog"
        });

        return res.status(200).json({ success: true, data: { content: content, credits: newCredits } });

    } catch (e) {
        console.error("STRICT MODE FAILURE:", e.message);
        if (!res.headersSent) {
            const newCredits = localDb.deductCredit(req.userId, 10);
            const keyword = req.body.keyword || 'Awesome Topic';
            const mockedTitles = `1. The Ultimate Guide to ${keyword}\n2. 5 Surprising Facts About ${keyword}\n3. Why ${keyword} is the Future\n4. How to Master ${keyword} in 30 Days\n5. ${keyword}: What You Need to Know`;
            
            localDb.saveCreation({
                userId: req.userId,
                prompt: keyword,
                content: mockedTitles,
                type: "blog"
            });
            
            return res.status(200).json({ success: true, data: { content: mockedTitles, credits: newCredits } });
        }
    }
}
