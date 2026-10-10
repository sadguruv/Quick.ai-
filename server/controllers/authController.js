
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { findUserByEmail, findUserById, createOrUpdateUser } from '../db/localDb.js';

// In-Memory OTP Store (ephemeral is fine — OTPs are short-lived)
// Map<email, { otp: string, expires: number }>
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

const sendOtpEmail = async (email, otp) => {
    const transporter = getTransporter();
    await transporter.sendMail({
        from: `"QuickAI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your QuickAI Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #4f46e5; margin-bottom: 8px;">QuickAI</h2>
                <p style="color: #374151; font-size: 16px;">Your one-time verification code is:</p>
                <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #111827;">${otp}</span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        `
    });
};

// ── SEND OTP (also used for Resend) ──────────────────────────────────────────
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const otp = generateOTP();
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

        otpStore.set(email, { otp, expires });
        console.log(`[AUTH] Sending OTP to ${email}...`);

        await sendOtpEmail(email, otp);
        console.log(`[AUTH] OTP sent to ${email}`);

        res.json({ success: true, message: 'Verification code sent to your email' });

    } catch (error) {
        console.error('[AUTH] OTP Send Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Check email config.', error: error.message });
    }
};

// ── VERIFY OTP & CREATE ACCOUNT ───────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, password, firstName, lastName, phone } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const storedData = otpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new one.' });
        }

        if (Date.now() > storedData.expires) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        // OTP valid — clear it
        otpStore.delete(email);

        let user = findUserByEmail(email);

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            const fullName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

            createOrUpdateUser({
                id: email,
                email,
                passwordHash,
                fullName,
                firstName: firstName || '',
                lastName: lastName || '',
                phone: phone || '',
                role: 'user'
            });

            user = findUserByEmail(email);
            console.log(`[AUTH] User saved to SQLite: ${email}`);
        }

        const token = `quickai-token-${user?.id || email}`;

        res.json({
            success: true,
            message: 'Verification successful',
            token,
            user: {
                id: user?.id || email,
                email,
                fullName: user?.full_name || email.split('@')[0],
                role: user?.role || 'user',
                plan: user?.plan || 'free',
                credits: user?.credits ?? 1000
            }
        });

    } catch (error) {
        console.error('[AUTH] Verify OTP Error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};

// ── LOGIN (Email + Password) ──────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and Password are required' });
        }

        // Look up user in SQLite
        let user = findUserByEmail(email);
        if (!user) {
            user = findUserById(email);
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'No account found. Please sign up first.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }

        const token = `quickai-token-${user.id}`;

        console.log(`[AUTH] Login success: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                plan: user.plan,
                credits: user.credits
            }
        });

    } catch (error) {
        console.error('[AUTH] Login Error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};
