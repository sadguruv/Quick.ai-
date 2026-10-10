import { generateSafeText } from "../utils/aiExecutor.js";
import * as localDb from "../db/localDb.js";

export async function generateCode(req, res) {
    try {
        const { prompt, language, task, existingCode } = req.body;
        console.log(`[Ollama Codex] Task: ${task} | Language: ${language} | Prompt: ${prompt}`);

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Code prompt is required" });
        }

        const userId = req.userId;
        const currentCredits = localDb.getCredits(userId);
        if (currentCredits < 10) {
            return res.status(400).json({ success: false, message: "Insufficient credits. Required: 10, Available: " + currentCredits });
        }

        // Build a precise code-focused user prompt
        let userPrompt = `Task: ${task || "Write Code"}\nLanguage: ${language || "JavaScript"}\nDescription: ${prompt}`;
        if (existingCode && existingCode.trim()) {
            userPrompt += `\n\nExisting code to work with:\n\`\`\`\n${existingCode}\n\`\`\``;
        }

        // System instruction that forces CODE output, not articles
        const systemInstruction = `You are an expert software engineer and code generator.
Your ONLY job is to output working, production-ready source code.

STRICT RULES:
- Output ONLY code. Do NOT write articles, essays, or explanations.
- Start your response with the code block immediately.
- Use proper syntax for the requested language.
- Include brief inline comments inside the code where helpful.
- Do NOT include phrases like "Here is the code" or "Let me explain".
- Do NOT wrap the entire response in markdown code fences — just output raw code.
- If the task is "Explain Code", output the explanation as code comments above each section.
- If the task is "Debug & Fix", output the corrected code with comments marking what was fixed.
- If the task is "Write Unit Tests", output complete runnable test code.
- If the task is "Convert Language", output the converted code in the target language.
- If the task is "Optimize Performance", output the optimized version with performance comments.`;

        const content = await generateSafeText(userPrompt, systemInstruction, {
            temperature: 0.3,
            numPredict: 800
        });

        const newCredits = localDb.deductCredit(userId, 10);
        localDb.saveCreation({
            userId,
            prompt: `[Codex] ${task} in ${language}: ${prompt}`,
            content: content,
            type: "code"
        });

        return res.status(200).json({ success: true, data: { content, credits: newCredits } });

    } catch (e) {
        console.error("Code Generation Error:", e.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: e.message || "Code generation failed" });
        }
    }
}
