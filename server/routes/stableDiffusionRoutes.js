
import express from "express";
import { generateImageController } from "../controllers/stableDiffusionController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/sd/generate
router.post("/generate", auth, generateImageController);

export default router;
