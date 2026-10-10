import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  ArrowUp,
  Brain,
  Mic,
  MicOff,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  Download,
  Eraser,
  RefreshCw,
  X,
  Share2,
  Bot,
  User,
  Wand2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth, useUser } from "../auth/MockClerk";
import { useCreditsContext } from "../context/CreditsContext";
import ToolPickerModal from "../components/ToolPickerModal";

const SESSIONS_STORAGE_KEY = "quickai_chat_sessions";
const ACTIVE_SESSION_ID_KEY = "quickai_active_session_id";

const ChatWorkspace = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { credits, updateCredits } = useCreditsContext();

  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false);
  const [thinkMode, setThinkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load Sessions on Mount & Listen to Sidebar selection
  useEffect(() => {
    const loadCurrentSession = () => {
      try {
        const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
        const sessions = rawSessions ? JSON.parse(rawSessions) : [];
        let activeId = localStorage.getItem(ACTIVE_SESSION_ID_KEY);

        if (activeId && sessions.length > 0) {
          const current = sessions.find((s) => s.id === activeId);
          if (current) {
            setCurrentSessionId(current.id);
            setMessages(current.messages || []);
            return;
          }
        }

        // If no active session or none found, start fresh
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id);
          setMessages(sessions[0].messages || []);
          localStorage.setItem(ACTIVE_SESSION_ID_KEY, sessions[0].id);
        } else {
          const newId = `chat_${Date.now()}`;
          setCurrentSessionId(newId);
          setMessages([]);
          localStorage.setItem(ACTIVE_SESSION_ID_KEY, newId);
        }
      } catch (e) {
        console.error("Failed to load chat sessions:", e);
      }
    };

    loadCurrentSession();

    // Listen to custom switch event from Sidebar
    const handleSwitchChat = (e) => {
      const targetId = e.detail?.id;
      if (!targetId) return;

      try {
        const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
        const sessions = rawSessions ? JSON.parse(rawSessions) : [];
        const found = sessions.find((s) => s.id === targetId);
        if (found) {
          setCurrentSessionId(found.id);
          setMessages(found.messages || []);
          localStorage.setItem(ACTIVE_SESSION_ID_KEY, found.id);
        }
      } catch (err) {}
    };

    const handleNewChat = () => {
      const newId = `chat_${Date.now()}`;
      setCurrentSessionId(newId);
      setMessages([]);
      localStorage.setItem(ACTIVE_SESSION_ID_KEY, newId);
      setInputPrompt("");
      setActiveTool(null);
      setUploadedFile(null);
      setFilePreview("");
    };

    window.addEventListener("quickai_load_session", handleSwitchChat);
    window.addEventListener("quickai_new_chat", handleNewChat);

    return () => {
      window.removeEventListener("quickai_load_session", handleSwitchChat);
      window.removeEventListener("quickai_new_chat", handleNewChat);
    };
  }, []);

  // Save conversation state to sessions storage
  const saveSessionMessages = (newMessages, promptForTitle) => {
    try {
      const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      let sessions = rawSessions ? JSON.parse(rawSessions) : [];
      let sessionId = currentSessionId || `chat_${Date.now()}`;

      const existingIndex = sessions.findIndex((s) => s.id === sessionId);

      if (existingIndex >= 0) {
        sessions[existingIndex].messages = newMessages;
        sessions[existingIndex].updatedAt = Date.now();
        if (promptForTitle && (!sessions[existingIndex].title || sessions[existingIndex].title === "New Conversation")) {
          sessions[existingIndex].title = promptForTitle.slice(0, 32);
        }
      } else {
        const newSession = {
          id: sessionId,
          title: (promptForTitle || "New Conversation").slice(0, 32),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: newMessages,
        };
        sessions.unshift(newSession);
        setCurrentSessionId(sessionId);
        localStorage.setItem(ACTIVE_SESSION_ID_KEY, sessionId);
      }

      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      window.dispatchEvent(new Event("quickai_sessions_updated"));
    } catch (e) {
      console.error("Save session error:", e);
    }
  };

  // Speech Recognition Setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast("Listening...", { icon: "🎙️" });
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploadedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview("");
    }
  };

  const handleSelectTool = (tool) => {
    setActiveTool(tool);
    if (tool.id === "upload_file" || tool.id === "remove_background" || tool.id === "review_resume") {
      fileInputRef.current?.click();
    }
    textareaRef.current?.focus();
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // SEND MESSAGE HANDLER
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const prompt = inputPrompt.trim();

    if (!prompt && !uploadedFile) {
      toast.error("Please enter a prompt or attach a file.");
      return;
    }

    const currentTool = activeTool?.id || "general_chat";
    const userMsg = {
      role: "user",
      content: prompt,
      filePreview: filePreview,
      fileName: uploadedFile?.name,
      tool: activeTool?.title || (thinkMode ? "Deep Reasoning" : "Fast AI"),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    saveSessionMessages(updatedWithUser, prompt || uploadedFile?.name);

    setInputPrompt("");
    setUploadedFile(null);
    setFilePreview("");
    setLoading(true);

    const token = await getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      let aiResponse = { type: "text", content: "" };

      // 1. IMAGE GENERATION
      if (currentTool === "create_image" || prompt.toLowerCase().startsWith("/image") || prompt.toLowerCase().startsWith("generate image")) {
        const cleanPrompt = prompt.replace(/^\/image\s*/i, "");
        const res = await fetch("http://localhost:5000/api/ai/generate-image", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: cleanPrompt || "A creative masterpiece" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to generate image");
        aiResponse = {
          type: "image",
          content: data.data?.content || data.content,
          prompt: cleanPrompt,
        };
        updateCredits(data.data?.credits);
      }
      // 2. BACKGROUND REMOVAL (File Upload)
      else if (currentTool === "remove_background" || uploadedFile?.type.startsWith("image/")) {
        if (!uploadedFile) {
          throw new Error("Please upload an image for background removal.");
        }
        const formData = new FormData();
        formData.append("image", uploadedFile);

        const res = await fetch("http://localhost:5000/api/ai/remove-image-background", {
          method: "POST",
          headers: headers,
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to remove background");
        aiResponse = {
          type: "bg_removed",
          content: data.data?.content || data.content,
          original: filePreview,
        };
        updateCredits(data.data?.credits);
      }
      // 3. RESUME REVIEW
      else if (currentTool === "review_resume" || uploadedFile?.name.endsWith(".pdf")) {
        if (!uploadedFile) {
          throw new Error("Please upload a PDF resume for ATS review.");
        }
        const formData = new FormData();
        formData.append("resume", uploadedFile);

        const res = await fetch("http://localhost:5000/api/ai/resume-review", {
          method: "POST",
          headers: headers,
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to review resume");
        aiResponse = {
          type: "resume",
          content: data.data?.content || data.content,
        };
        updateCredits(data.data?.credits);
      }
      // 4. BLOG TITLES
      else if (currentTool === "blog_titles" || prompt.toLowerCase().startsWith("/titles") || prompt.toLowerCase().startsWith("blog titles")) {
        const keyword = prompt.replace(/^\/titles\s*/i, "");
        const res = await fetch("http://localhost:5000/api/ai/generate-blog-title", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: keyword || prompt }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to generate blog titles");
        aiResponse = {
          type: "blog_titles",
          content: data.data?.content || data.content,
        };
        updateCredits(data.data?.credits);
      }
      // 5. AI CODEX STUDIO (Code Generation)
      else if (currentTool === "codex" || prompt.toLowerCase().startsWith("/code")) {
        const cleanPrompt = prompt.replace(/^\/code\s*/i, "");
        const res = await fetch("http://localhost:5000/api/ai/generate-code", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: cleanPrompt || prompt,
            language: "JavaScript",
            task: "Write Code",
            existingCode: "",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Code generation failed");
        aiResponse = {
          type: "code",
          content: data.data?.content || data.content,
        };
        updateCredits(data.data?.credits);
      }
      // 6. ARTICLE WRITER & GENERAL CHAT (Powered by Ollama)
      else {
        const res = await fetch("http://localhost:5000/api/ai/generate-article", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: prompt,
            length: thinkMode ? "Long" : "Medium",
            tone: thinkMode ? "Professional" : "Conversational",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "AI generation failed");
        aiResponse = {
          type: "article",
          content: data.data?.content || data.content,
        };
        updateCredits(data.data?.credits);
      }

      const finalMessages = [
        ...updatedWithUser,
        {
          role: "assistant",
          ...aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ];

      setMessages(finalMessages);
      saveSessionMessages(finalMessages);

    } catch (err) {
      console.error("Execution error:", err);
      toast.error(err.message || "Something went wrong.");
      const errorMsg = {
        role: "assistant",
        type: "error",
        content: `⚠️ Error: ${err.message || "Unable to reach AI service. Please verify your connection."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const finalWithErr = [...updatedWithUser, errorMsg];
      setMessages(finalWithErr);
      saveSessionMessages(finalWithErr);
    } finally {
      setLoading(false);
      setActiveTool(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownloadImage = (base64Data, filename = "quickai_image.png") => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename;
    link.click();
  };

  // REMOVE BACKGROUND ON CREATED/GENERATED IMAGE
  const handleTriggerBgRemovalOnImage = async (base64Img) => {
    toast("Removing background with Rembg...", { icon: "✂️" });
    try {
      setLoading(true);
      const token = await getToken();

      const res = await fetch("http://localhost:5000/api/ai/remove-image-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: base64Img,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Background removal failed");

      const transparentContent = data.data?.content || data.content;
      const bgMsg = {
        role: "assistant",
        type: "bg_removed",
        content: transparentContent,
        original: base64Img,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => {
        const next = [...prev, bgMsg];
        saveSessionMessages(next);
        return next;
      });

      if (data.data?.credits !== undefined) {
        updateCredits(data.data.credits);
      }
      toast.success("Background removed cleanly!");
    } catch (e) {
      console.error("Bg removal on image error:", e);
      toast.error(e.message || "Background removal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0d0d0d] text-gray-900 dark:text-white relative transition-colors duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,application/pdf"
      />

      {/* Main Conversation Feed / Welcome Screen */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 sm:px-6 md:px-12 max-w-4xl w-full mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-start min-h-[420px] pt-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Hi! 👋 😊
              </h1>
              <p className="text-xl sm:text-2xl font-medium text-gray-700 dark:text-gray-300">
                Good to see you again. What are we working on today? 🔥
              </p>
            </motion.div>

            {/* Quick Action Suggestion Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full mt-8"
            >
              {[
                { title: "🎨 Create an Image", prompt: "A hyper-realistic futuristic neon city at dusk with flying vehicles" },
                { title: "📝 Write an Article", prompt: "Explain the architecture of autonomous AI agents in 2026" },
                { title: "✂️ Remove Background", prompt: "Remove the background from my uploaded image" },
                { title: "💡 Viral Blog Titles", prompt: "Give me 10 viral headlines about Next-Gen Web Development" },
                { title: "📄 Review My Resume", prompt: "Analyze my uploaded resume and provide an ATS score" },
                { title: "🌐 Deep Research", prompt: "Summarize the latest developments in local LLMs and Ollama" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputPrompt(chip.prompt);
                    textareaRef.current?.focus();
                  }}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 text-left transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-primary">
                    {chip.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {chip.prompt}
                  </p>
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6 pb-24">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-3xl p-5 ${
                  msg.role === "user"
                    ? "bg-indigo-600 dark:bg-[#252529] text-white shadow-md rounded-br-md"
                    : "bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/5 shadow-sm rounded-bl-md"
                }`}>
                  {msg.fileName && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-medium w-fit">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{msg.fileName}</span>
                    </div>
                  )}

                  {msg.filePreview && (
                    <img
                      src={msg.filePreview}
                      alt="Upload"
                      className="max-h-48 rounded-xl object-contain mb-3 border border-gray-200 dark:border-white/10"
                    />
                  )}

                  {msg.type === "image" && (
                    <div className="space-y-3">
                      <img
                        src={msg.content}
                        alt="AI Generation"
                        className="w-full max-h-[480px] object-contain rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg bg-black/5 dark:bg-black/40"
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => handleDownloadImage(msg.content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-xs font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Image
                        </button>
                        <button
                          onClick={() => handleTriggerBgRemovalOnImage(msg.content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-500/30 transition-colors"
                        >
                          <Eraser className="w-3.5 h-3.5" /> Remove Background
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.type === "bg_removed" && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/10">
                        <img
                          src={msg.content}
                          alt="Transparent Cutout"
                          className="w-full max-h-[420px] object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadImage(msg.content, "transparent_subject.png")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-500/30 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Transparent PNG
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.type === "resume" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm border-b border-gray-200 dark:border-white/10 pb-2">
                        <Sparkles className="w-4 h-4" /> ATS Resume Analysis Report
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {msg.type === "code" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-xs border-b border-gray-200 dark:border-white/10 pb-2">
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold">{"</>"}</span>
                        AI Codex Studio Output
                      </div>
                      <div className="p-4 rounded-2xl bg-[#1e1e2e] text-gray-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto no-scrollbar border border-gray-700 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/5 text-xs text-gray-400">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          className="flex items-center gap-1 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedIndex === idx ? "Copied" : "Copy Code"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {(msg.type === "article" || msg.type === "blog_titles" || msg.type === "text" || !msg.type) && (
                    <div className="space-y-3">
                      <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.content}
                      </div>
                      {msg.role === "assistant" && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/5 text-xs text-gray-400">
                          <span>{msg.timestamp}</span>
                          <button
                            onClick={() => handleCopy(msg.content, idx)}
                            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-white transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md font-bold text-xs text-white">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm py-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Generating response with Ollama...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Omnibar */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2 relative">
        {activeTool && (
          <div className="mb-2 flex items-center gap-2 bg-purple-50 dark:bg-[#212124] text-xs font-medium px-3 py-1.5 rounded-xl border border-purple-200 dark:border-white/10 w-fit text-purple-700 dark:text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mode: {activeTool.title}</span>
            <button
              onClick={() => setActiveTool(null)}
              className="hover:text-purple-900 dark:hover:text-white ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {uploadedFile && (
          <div className="mb-2 flex items-center gap-3 bg-gray-100 dark:bg-[#1e1e24] p-2 px-3 rounded-xl border border-gray-200 dark:border-white/10 text-xs w-fit">
            <Paperclip className="w-4 h-4 text-indigo-500" />
            <span className="truncate max-w-[200px] text-gray-800 dark:text-gray-200">{uploadedFile.name}</span>
            <button
              onClick={() => {
                setUploadedFile(null);
                setFilePreview("");
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="relative">
          <ToolPickerModal
            isOpen={isToolPickerOpen}
            onClose={() => setIsToolPickerOpen(false)}
            onSelectTool={handleSelectTool}
          />
        </div>

        {/* The Omnibar Input Bar */}
        <div className="relative flex items-center bg-white dark:bg-[#1f1f23] border border-gray-300 dark:border-white/10 rounded-3xl shadow-xl p-2 pl-3 focus-within:border-indigo-500 transition-all duration-200">
          <button
            type="button"
            onClick={() => setIsToolPickerOpen((prev) => !prev)}
            title="Add tools, files & plugins"
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
          >
            <Plus className={`w-5 h-5 transition-transform duration-200 ${isToolPickerOpen ? "rotate-45" : ""}`} />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTool
                ? `Ask or instruct ${activeTool.title}...`
                : "Ask anything..."
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none max-h-36 overflow-y-auto"
          />

          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <button
              type="button"
              onClick={() => setThinkMode((prev) => !prev)}
              title={thinkMode ? "Deep Reasoning Active" : "Enable Deep Reasoning"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                thinkMode
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Think</span>
            </button>

            <button
              type="button"
              onClick={toggleVoice}
              title={isListening ? "Listening... Click to stop" : "Voice dictation"}
              className={`p-2.5 rounded-full transition-colors ${
                isListening
                  ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse"
                  : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={loading || (!inputPrompt.trim() && !uploadedFile)}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                inputPrompt.trim() || uploadedFile
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95"
                  : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWorkspace;
