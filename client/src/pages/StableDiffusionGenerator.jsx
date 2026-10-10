
import { useState } from "react";
import { Sparkles, Download, Wand2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { useAuth } from "../auth/MockClerk";
import { useCreditsContext } from "../context/CreditsContext";

const StableDiffusionGenerator = () => {
    const { getToken } = useAuth();
    const { updateCredits } = useCreditsContext();
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError(null);
        setImage(null);

        if (!prompt || prompt.trim() === "") {
            toast.error("Please enter a prompt");
            return;
        }

        setLoading(true);

        try {
            const token = await getToken();
            const response = await fetch("http://localhost:5000/api/sd/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            if (data.data && data.data.content) {
                setImage(data.data.content);
                if (data.data.credits !== undefined) {
                    updateCredits(data.data.credits);
                } else {
                    updateCredits();
                }
                toast.success("Image generated successfully!");
            } else {
                throw new Error("No image data received");
            }

        } catch (err) {
            console.error("SD Generation Error:", err);
            setError(err.message);
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full p-6 lg:p-10 bg-[#F4F7FB] text-slate-700 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-lg shadow-indigo-200">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Stable Diffusion</h1>
                                <p className="text-sm text-gray-500 font-medium">Local AI Image Generator</p>
                            </div>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-[10px]">Prompt</label>
                                <textarea
                                    onChange={(e) => setPrompt(e.target.value)}
                                    value={prompt}
                                    rows={5}
                                    placeholder="A cyberpunk street with neon lights, 8k resolution, cinematic lighting..."
                                    className="w-full p-5 text-base rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none bg-gray-50/50 font-medium text-gray-700 placeholder:text-gray-400"
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full group relative flex justify-center items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                {loading ? (
                                    <RefreshCw className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        <span>Generate Image</span>
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 flex flex-col h-full min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Result</h2>
                        {image && (
                            <a
                                href={image}
                                download={`sd-generation-${Date.now()}.png`}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hovering:bg-gray-200 rounded-xl text-gray-700 font-semibold text-sm transition-all hover:bg-gray-200"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                        )}
                    </div>

                    <div className="flex-1 rounded-2xl bg-gray-50/50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                        <AnimatePresence mode="wait">
                            {image ? (
                                <motion.img
                                    key="image"
                                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    transition={{ duration: 0.5 }}
                                    src={image}
                                    alt="Generated Art"
                                    className="w-full h-full object-contain shadow-sm"
                                />
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-gray-400 p-8"
                                >
                                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="w-10 h-10 text-indigo-300" />
                                    </div>
                                    <p className="font-bold text-lg text-gray-500">Ready to create</p>
                                    <p className="text-sm mt-2 text-gray-400 max-w-[200px] mx-auto">Enter a detailed prompt to see Stable Diffusion magic.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StableDiffusionGenerator;
