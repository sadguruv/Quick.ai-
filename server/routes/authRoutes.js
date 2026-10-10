
import express from "express";
import { sendOtp, verifyOtp, login } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/login", login);

export default authRouter;
