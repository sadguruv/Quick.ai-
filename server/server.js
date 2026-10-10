
import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/authRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";
import sdRouter from "./routes/stableDiffusionRoutes.js";
import { requireAuth } from "./middlewares/authMiddleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in local dev
    }
  },
  credentials: true
}));
app.use(express.json());

// Public Auth Routes
app.use("/api/auth", authRouter);

// Protected Routes
app.use("/api/ai", requireAuth(), aiRouter);
app.use("/api/user", requireAuth(), userRouter);
app.use("/api/sd", requireAuth(), sdRouter);
app.get("/api/health", (req, res) => res.status(200).json({ status: "OK", timestamp: new Date() }));

// Global Crash Guard
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection:', reason);
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} => http://localhost:${PORT} 🍽️`
  );
});
