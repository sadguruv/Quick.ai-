
// Custom Auth Middleware to replace Clerk
export const requireAuth = () => {
    return (req, res, next) => {
        // Check for our custom token header
        // Frontend should send: Authorization: Bearer quickai-token-...
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer quickai-token-")) {
            // Allow public access to public routes if needed, otherwise 401
            // For this project structure, we want to block access to /api/ai routes
            return res.status(401).json({ success: false, message: "Unauthorized: Missing or Invalid Token" });
        }

        // Mock User Extraction from Token (Since we aren't using real JWTs yet)
        // In a real app, verify(token) here.
        req.auth = {
            userId: "custom-otp-user", // Placeholder ID
            has: () => true // Allow access
        };

        next();
    };
};
