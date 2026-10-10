
// Native Fetch (Node 18+)
const testOtp = async () => {
    try {
        console.log("Testing OTP Sending to http://localhost:5001/api/auth/send-otp...");
        const response = await fetch('http://localhost:5001/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "test@example.com" })
        });

        console.log("Response Status:", response.status);
        const text = await response.text();
        console.log("Response Body:", text);

    } catch (error) {
        console.error("Fetch Error:", error.message);
        console.log("Ensure server is running on port 5001.");
    }
};

testOtp();