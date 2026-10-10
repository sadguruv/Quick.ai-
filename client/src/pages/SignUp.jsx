
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useRole } from "../context/RoleContext";
import toast from "react-hot-toast";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SignUp = () => {
    const navigate = useNavigate();
    const { loginAsUser } = useRole();

    // Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Auth Flow State
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0); // seconds
    const cooldownRef = useRef(null);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        cooldownRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(cooldownRef.current);
    }, [resendCooldown > 0]);

    // --- Actions ---

    const handleSendOtp = async (e) => {
        e.preventDefault();

        // Strict Validation
        if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
            return toast.error("Please fill in all details");
        }
        if (password.length < 6) return toast.error("Password must be at least 6 characters");
        if (password !== confirmPassword) return toast.error("Passwords do not match");
        if (phone.length < 10) return toast.error("Please enter a valid phone number");

        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/send-otp`, { email });
            toast.success("Verification code sent to your email!", { duration: 5000 });
            setOtpSent(true);
            setResendCooldown(60); // start 60s cooldown
        } catch (error) {
            console.error("Send OTP Error:", error);
            const msg = error.response?.data?.message || "Failed to send OTP";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) return toast.error("Enter the 6-digit code");

        setLoading(true);
        try {
            // Include password in verification payload to create account
            const payload = {
                email,
                otp,
                password,
                firstName,
                lastName,
                phone
            };

            const { data } = await axios.post(`${API_URL}/auth/verify-otp`, payload);

            if (data.success) {
                toast.success("Account Created Successfully!");

                // Save Token
                localStorage.setItem("token", data.token);

                const userInfo = {
                    ...data.user,
                    fullName: `${firstName} ${lastName}`.trim(),
                    firstName,
                    lastName,
                    phone
                };
                localStorage.setItem("user_info", JSON.stringify(userInfo));

                loginAsUser();
                navigate("/ai");
            }
        } catch (error) {
            console.error("Verify Error:", error);
            const msg = error.response?.data?.message || "Invalid Code";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-[#f8f9fc] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row min-h-[700px] shadow-indigo-100/50"
            >

                {/* LEFT: Gradient + Logo + Headline */}
                <div className="w-full md:w-[40%] bg-gradient-to-br from-indigo-600 to-violet-600 hidden md:flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

                    <div className="relative z-10 text-center">
                        <img
                            src={assets.logo}
                            alt="QuickAI"
                            className="h-14 w-auto mx-auto mb-8 bg-white/10 p-2 rounded-xl backdrop-blur-sm"
                        />
                        <h2 className="text-3xl font-bold mb-4 tracking-tight leading-snug">
                            Join the Community
                        </h2>
                        <p className="text-indigo-100/90 text-sm leading-relaxed max-w-xs mx-auto">
                            "QuickAI has completely transformed how I create content. It's fast, intuitive, and powerful."
                        </p>
                    </div>
                </div>

                {/* RIGHT: Form Panel */}
                <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="max-w-lg mx-auto w-full">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Create Account</h3>
                            <p className="text-gray-500 text-sm mt-1">Get started with your free account today.</p>
                        </div>

                        <form className="space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>

                            {/* Personal Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200"
                                        placeholder="+1 555 000 0000"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200"
                                        placeholder="jane@company.com"
                                    />
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Confirm</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>


                            {/* OTP Input - Animated Reveal */}
                            <AnimatePresence>
                                {otpSent && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="group pt-2 pb-1">
                                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                                <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Verification Code</label>
                                                {/* Resend OTP */}
                                                <button
                                                    type="button"
                                                    disabled={resendCooldown > 0 || loading}
                                                    onClick={async () => {
                                                        try {
                                                            setLoading(true);
                                                            await axios.post(`${API_URL}/auth/send-otp`, { email });
                                                            toast.success("New OTP sent to your email!");
                                                            setResendCooldown(60);
                                                        } catch (err) {
                                                            toast.error("Failed to resend OTP");
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    className="text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    style={{ color: resendCooldown > 0 ? '#9ca3af' : '#4f46e5' }}
                                                >
                                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-center tracking-[0.5em] font-bold text-xl"
                                                placeholder="••••••"
                                                autoFocus
                                            />
                                            <p className="text-xs text-gray-400 mt-1 ml-1">Code expires in 5 minutes.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (otpSent ? "Verify & Create Account" : "Send Verification Code")}
                            </button>

                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-500">
                                    Already have an account?{" "}
                                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUp;
