export const ENDPOINTS = {
    article: '/api/ai/generate-article', // Verified server/routes/aiRoutes.js
    titles: '/api/ai/generate-blog-title', // Verified: Singular 'title' in server
    image: '/api/ai/generate-image',
    bgErase: '/api/ai/remove-image-background',

    resume: '/api/ai/resume-review', // Verified: Server uses 'resume-review'
};

// Legacy support if needed
export const API_ENDPOINTS = {
    AI: {
        WRITE_ARTICLE: ENDPOINTS.article,
        GENERATE_IMAGE: ENDPOINTS.image,
        REMOVE_BACKGROUND: ENDPOINTS.bgErase,
        GENERATE_BLOG_TITLES: ENDPOINTS.titles,
        REMOVE_OBJECT: ENDPOINTS.objRem,
        RESUME_REVIEW: ENDPOINTS.resume
    }
};
