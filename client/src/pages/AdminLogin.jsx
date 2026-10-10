import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useRole } from "../context/RoleContext";
import toast from "react-hot-toast";
import { ShieldAlert } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminLogin = () => {
    const navigate = useNavigate();
    const { loginAsUser } = useRole();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter admin credentials");
            return;
        }

        const cleanEmail = email.trim().toLowerCase() === "admin" ? "admin@quickai.com" : email.trim().toLowerCase();
        const cleanPass = password.trim();

        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, { email: cleanEmail, password: cleanPass });
            if (data.success) {
                toast.success("Welcome Back Admin!");
                localStorage.setItem("token", data.token);
                localStorage.setItem("user_info", JSON.stringify(data.user));
                loginAsUser();
                navigate("/ai");
            }
        } catch (error) {
            console.error("Admin Login Error:", error);
            const msg = error.response?.data?.message || "Invalid Admin Credentials.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('/gradientBackground.png')] opacity-10 bg-cover"></div>

            <div className="w-full max-w-md space-y-8 bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-700 z-10">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                        <ShieldAlert className="w-8 h-8 text-indigo-400" />
                    </div>
                    <img
                        className="mx-auto h-8 w-auto mb-4 opacity-70"
                        src={assets.logo}
                        style={{ filter: "brightness(0) invert(1)" }}
                        alt="QuickAI"
                    />
                    <h2 className="text-3xl font-bold text-white tracking-wide">
                        Service Provider
                    </h2>
                    <p className="mt-2 text-sm text-gray-400 font-mono tracking-wider">
                        SECURE ADMIN ACCESS
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-400 mb-1">Admin Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="text"
                                autoComplete="username"
                                required
                                className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                                placeholder="admin"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Secure Key / Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 shadow-lg shadow-indigo-500/30"
                        >
                            Authenticate
                        </button>
                    </div>
                </form>

                <div className="mt-4 flex justify-center">
                    <button onClick={() => navigate("/")} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                        ← Return to public site
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
