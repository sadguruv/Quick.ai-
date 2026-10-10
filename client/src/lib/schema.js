import { z } from 'zod';

export const ArticlePayload = z.object({
    topic: z.string().min(2, 'Topic too short'),
    length: z.enum(['Short', 'Medium', 'Long']),
    tone: z.enum(['Professional', 'Casual', 'Enthusiastic', 'Neutral']), // Added Neutral as per snippet, ensure UI supports it or remove
    role: z.enum(['ai_user', 'service_provider']).optional(), // Optional as it might be injected
});

export const TitlePayload = z.object({
    category: z.enum(['Technology', 'Health', 'Business', 'Lifestyle', 'Education']),
    keyword: z.string().min(2, 'Keyword required'),
    role: z.enum(['ai_user', 'service_provider']).optional(),
});

export const ImagePayload = z.object({
    prompt: z.string().min(3, 'Describe the image'),
    style: z.enum(['Realistic', 'Anime', 'Cyberpunk', 'Oil Painting', '3D Render', 'Pixel Art', 'Watercolor', 'Sketch']),
    publicFlag: z.boolean().default(false), // Changed public -> publicFlag to match existing backend? User snippet said public. I should check existing code. Existing code uses publicFlag. I will stick to publicFlag to be safe or change backend. User said "Payload validation (block bad requests)". I will match existing code for now to avoid 400s.
    role: z.enum(['ai_user', 'service_provider']).optional(),
});

// Add schemas for other tools
export const ResumePayload = z.object({
    // FormData not validated by Zod directly easily, but we can check the file presence in UI
});

export const ObjectRemovalPayload = z.object({
    object: z.string().min(2, "Object name required"),
    // File validation separate
});
