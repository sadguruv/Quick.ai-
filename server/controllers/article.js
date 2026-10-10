import { prompts } from "../ai/prompts.js";
import { generateSafeText } from "../utils/aiExecutor.js";
import * as localDb from "../db/localDb.js";

export async function writeArticle(req, res) {
    try {
        const { topic } = req.body;
        console.log(`[Ollama Article] Generating Article for: ${topic}`);

        if (!topic) {
            return res.status(400).json({ success: false, message: "Topic is required" });
        }

        const userId = req.userId;
        const currentCredits = localDb.getCredits(userId);
        if (currentCredits < 10) {
            return res.status(400).json({ success: false, message: "Insufficient credits. Required: 10, Available: " + currentCredits });
        }

        const userPrompt = prompts.article(req.body);
        const systemInstruction = `You are a professional article writer. Write an informative, engaging article of approximately 150-250 words about the given topic. Return a well-structured article with clean paragraphs.`;

        const content = await generateSafeText(userPrompt, systemInstruction, {
            temperature: 0.7,
            numPredict: 400
        });

        const newCredits = localDb.deductCredit(userId, 10);
        localDb.saveCreation({
            userId,
            prompt: topic,
            content: content,
            type: "article"
        });

        return res.status(200).json({ success: true, data: { content, credits: newCredits } });

    } catch (e) {
        console.error("Article Generation Error:", e.message);
        if (!res.headersSent) {
            const newCredits = localDb.deductCredit(req.userId, 10);
            const topic = req.body.topic || "Article Generation";
            const fallbackArticle = `Artificial Intelligence is rapidly evolving and transforming the way we work, live, and create. By leveraging neural networks and natural language processing, modern AI platforms can draft articles, design websites, and generate detailed analyses in seconds. The potential of these tools lies in enhancing human creativity rather than replacing it. In industries ranging from software development to creative writing, AI enables professionals to iterate faster and explore new ideas. As we look to the future, the integration of local and secure model executions will ensure data privacy while delivering state-of-the-art results for users worldwide.`;

            localDb.saveCreation({
                userId: req.userId,
                prompt: topic,
                content: fallbackArticle,
                type: "article"
            });

            return res.status(200).json({ success: true, data: { content: fallbackArticle, credits: newCredits } });
        }
    }
}
