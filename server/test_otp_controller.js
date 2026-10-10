
import 'dotenv/config';
import { sendOtp } from './controllers/authController.js';

// Mock Request
const req = {
    body: {
        email: process.env.EMAIL_USER // Use the sender email for testing
    }
};

// Mock Response
const res = {
    status: (code) => {
        console.log(`[Response Status]: ${code}`);
        return res;
    },
    json: (data) => {
        console.log(`[Response JSON]:`, JSON.stringify(data, null, 2));
        return res;
    }
};

console.log("Testing sendOtp controller...");
sendOtp(req, res).then(() => {
    console.log("Controller execution complete.");
}).catch(err => {
    console.error("Controller execution FAILED:", err);
});
