
import nodemailer from 'nodemailer';
import 'dotenv/config';

async function testEmail() {
    console.log("Testing Email configuration...");
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`Port: ${process.env.EMAIL_PORT}`);
    console.log(`User: ${process.env.EMAIL_USER}`);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log("Verifying transporter connection...");
        await transporter.verify();
        console.log("Transporter verification SUCCESS!");

        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: `"Test Script" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: "QuickAI Email Test",
            text: "If you see this, email sending is working!",
        });

        console.log("Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("Email Test FAILED:");
        console.error(error);
    }
}

testEmail();
