import React, { useState } from "react";
import {
  Code,
  Sparkles,
  Copy,
  Check,
  Play,
  Terminal,
  RefreshCw,
  Zap,
  Layers,
  FileCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../auth/MockClerk";
import { useCreditsContext } from "../context/CreditsContext";

const LANGUAGES = [
  "JavaScript",
  "Python",
  "React / JSX",
  "TypeScript",
  "HTML & CSS",
  "SQL",
  "C++",
  "Java",
  "Go",
  "Rust"
];

const CODE_TASKS = [
  "Write Code",
  "Explain Code",
  "Debug & Fix",
  "Optimize Performance",
  "Convert Language",
  "Write Unit Tests"
];

const Codex = () => {
  const { getToken } = useAuth();
  const { updateCredits, checkCredits } = useCreditsContext();

  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [task, setTask] = useState("Write Code");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please describe what code you want to write or debug.");
      return;
    }

    if (!checkCredits(10)) {
      toast.error("Insufficient credits. Required: 10 credits.");
      return;
    }

    setLoading(true);
    setGeneratedCode("");

    try {
      const token = await getToken();

      const response = await fetch("http://localhost:5000/api/ai/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          language: language,
          task: task,
          existingCode: codeSnippet || "",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Code generation failed");

      const result = data.data?.content || data.content;
      setGeneratedCode(result);
      if (data.data?.credits !== undefined) {
        updateCredits(data.data.credits);
      } else {
        updateCredits();
      }
      toast.success("Code generated successfully!", { icon: "💻" });

      // Save to recent creations in localStorage
      try {
        const recent = JSON.parse(localStorage.getItem("quickai_recent_chats") || "[]");
        const newEntry = {
          id: Date.now().toString(),
          title: `Codex: ${prompt.substring(0, 30)}...`,
          active: false,
        };
        localStorage.setItem("quickai_recent_chats", JSON.stringify([newEntry, ...recent]));
      } catch (e) {}

    } catch (err) {
      console.error("Codex Error:", err);
      toast.error(err.message || "Failed to generate code with Ollama");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full h-full overflow-y-auto no-scrollbar p-6 lg:p-10 bg-[#f8fafc] dark:bg-[#0d0d0d] text-gray-900 dark:text-white transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Codex Studio</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Write, refactor, debug, and explain code powered by Ollama
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 w-fit flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Ollama Code Assistant
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls & Prompt Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleGenerateCode} className="p-6 rounded-3xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 shadow-sm space-y-5">
              {/* Task Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Task
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CODE_TASKS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTask(t)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center ${
                        task === t
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-gray-50 dark:bg-[#1f1f23] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Language / Framework
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-white dark:bg-[#18181b]">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Instruction / Prompt
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Create a responsive navigation bar with dark mode toggle in Tailwind CSS"
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Existing Code Snippet (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Existing Code (Optional)
                </label>
                <textarea
                  rows={4}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste existing code here if you want to debug, explain, or refactor..."
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                  loading || !prompt.trim()
                    ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-60"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing Code with Ollama...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    <span>Generate Code</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Code Output Console */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 shadow-sm min-h-[520px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Code Output Console
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                      {language}
                    </span>
                  </div>

                  {generatedCode && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-xs font-semibold transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Code Content */}
                {generatedCode ? (
                  <div className="p-4 rounded-2xl bg-gray-900 text-gray-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto border border-gray-800 whitespace-pre-wrap">
                    {generatedCode}
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-gray-500">
                    <FileCode className="w-12 h-12 mb-3 stroke-[1.5] text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium">No code generated yet.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Choose your task, enter your requirements, and click Generate.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span>⚡ Powered by local Ollama engine</span>
                <span>🪙 10 credits / generation</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Codex;
