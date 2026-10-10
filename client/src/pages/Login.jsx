
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useRole } from "../context/RoleContext";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Login = () => {
    const navigate = useNavigate();
    const { loginAsUser } = useRole();

    // Form State (Email/Password Only)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            return toast.error("Please fill in all fields");
        }

        setLoading(true);

        try {
            // REAL API CALL
            const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });

            if (data.success) {
                toast.success("Welcome Back!");

                // Save Token
                localStorage.setItem("token", data.token);
                localStorage.setItem("user_info", JSON.stringify(data.user));

                loginAsUser();
                navigate("/ai");
            }
        } catch (error) {
            console.error("Login Error:", error);
            const msg = error.response?.data?.message || "Invalid credentials";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-[#f8f9fc] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row min-h-[600px] shadow-indigo-100/50"
            >

                {/* LEFT: Gradient + Logo + Headline */}
                <div className="w-full md:w-1/2 relative bg-gradient-to-br from-indigo-600 to-violet-600 hidden md:flex flex-col items-center justify-center p-12 text-white overflow-hidden">
                    <div className="relative z-10 text-center">
                        <img
                            src={assets.logo}
                            alt="QuickAI"
                            className="h-16 w-auto mx-auto mb-8 bg-white/10 p-2 rounded-xl backdrop-blur-sm"
                        />
                        <h2 className="text-4xl font-bold mb-6 tracking-tight">
                            Start your journey with Quick.ai
                        </h2>
                        <p className="text-indigo-100 text-lg max-w-sm mx-auto leading-relaxed">
                            Log in to access your dashboard and continue creating amazing content.
                        </p>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                </div>

                {/* RIGHT: Form Panel */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-left mb-10">
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h3>
                            <p className="text-gray-500">
                                Enter your email and password to sign in.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleLogin}>
                            {/* Email Input */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                                    placeholder="name@example.com"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400 pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-4"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                Don't have an account?{" "}
                                <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline">
                                    Sign up for free
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
