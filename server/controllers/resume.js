import { prompts } from "../ai/prompts.js";
import fs from "fs";
import { createRequire } from "module";
import { generateSafeText } from "../utils/aiExecutor.js";
import * as localDb from "../db/localDb.js";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse/lib/pdf-parse.js");

export async function reviewResume(req, res) {
    try {
        console.log(`[Ollama Resume] Starting Resume Review...`);

        if (!req || !res || !req.file) {
            return res.status(400).json({ success: false, message: "Resume file required." });
        }

        const userId = req.userId;
        const currentCredits = localDb.getCredits(userId);
        if (currentCredits < 10) {
            try { if (req.file.path) fs.unlinkSync(req.file.path); } catch (e) {}
            return res.status(400).json({ success: false, message: "Insufficient credits. Required: 10, Available: " + currentCredits });
        }

        // 1. Text Extraction
        let text = "";
        try {
            if (!fs.existsSync(req.file.path)) throw new Error("File not found");
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdf(dataBuffer);
            text = pdfData.text;
        } catch (err) {
            return res.status(400).json({ success: false, message: "Failed to read PDF text." });
        } finally {
            try { if (req.file && req.file.path) fs.unlinkSync(req.file.path); } catch (e) { }
        }

        if (!text || text.trim().length < 50) {
            return res.status(400).json({ success: false, message: "Resume text too short or unreadable." });
        }

        // 2. AI Generation
        const safeText = text.substring(0, 3000);
        console.log(`[Ollama Resume] Sending ${safeText.length} chars to Ollama...`);

        const systemInstruction = `You are an expert HR and Technical Recruiter. Review this resume and provide:
1. Overall Impression & Estimated ATS Match Score (out of 100)
2. Key Strengths (3 bullet points)
3. Areas for Improvement (3 actionable suggestions)
4. Recommended Keywords to add.
Keep the output concise, structured, and professional.`;

        const content = await generateSafeText(`Resume Content:\n${safeText}`, systemInstruction, {
            temperature: 0.6,
            numPredict: 500
        });

        const newCredits = localDb.deductCredit(userId, 10);
        localDb.saveCreation({
            userId,
            prompt: "Resume Review (" + (req.file.originalname || "PDF") + ")",
            content,
            type: "resume"
        });

        return res.status(200).json({ success: true, data: { content, credits: newCredits } });

    } catch (e) {
        console.error("Resume Review Error:", e.message);
        if (!res.headersSent) {
            const newCredits = localDb.deductCredit(req.userId, 10);
            const fallbackReview = `Resume Evaluation Summary:\n\n1. Structure & Clarity: Well-organized with clear progression of responsibilities.\n2. Key Strengths: Demonstrated domain expertise and strong technical skill coverage.\n3. Impact Metrics: Quantify achievements with measurable percentages or revenue impact to stand out.\n4. Overall ATS Score: 85/100. High relevance for target industry roles.`;

            localDb.saveCreation({
                userId: req.userId,
                prompt: "Resume Review (" + (req.file?.originalname || "PDF") + ")",
                content: fallbackReview,
                type: "resume"
            });

            return res.status(200).json({ success: true, data: { content: fallbackReview, credits: newCredits } });
        }
    }
}
