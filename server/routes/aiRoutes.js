import express from "express";
import { auth } from "../middlewares/auth.js";
import { writeArticle } from "../controllers/article.js";
import { blogTitles } from "../controllers/blog.js";
import { reviewResume } from "../controllers/resume.js";
import { generateCode } from "../controllers/codex.js";
import {
  generateImage,
  removeImageBackground,
} from "../controllers/aiController.js";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

// Middleware to block non-registered guest requests
const requireRealUser = (req, res, next) => {
  if (!req.userId || req.userId === 'guest') {
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in first." });
  }
  next();
};

const authMiddleware = [auth, requireRealUser];

aiRouter.post("/generate-article", authMiddleware, writeArticle);
aiRouter.post("/generate-blog-title", authMiddleware, blogTitles);
aiRouter.post("/generate-code", authMiddleware, generateCode);
aiRouter.post("/generate-image", authMiddleware, generateImage);

aiRouter.post(
  "/remove-image-background",
  upload.single("image"),
  authMiddleware,
  removeImageBackground
);

aiRouter.post("/resume-review", upload.single("resume"), authMiddleware, reviewResume);

export default aiRouter;
