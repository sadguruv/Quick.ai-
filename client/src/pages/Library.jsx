import React, { useEffect, useState } from "react";
import { FolderOpen, Sparkles, Image, FileText, Download, Copy, Check, RefreshCw, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../auth/MockClerk";

const Library = () => {
  const { getToken } = useAuth();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const fetchUserCreations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/user/get-user-creations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreations(data.data?.creations || data.creations || []);
      }
    } catch (e) {
      console.error("Failed to load creations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCreations();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadImage = (content, prompt) => {
    const link = document.createElement("a");
    link.href = content;
    link.download = `${prompt.substring(0, 20).replace(/\s+/g, "_")}.png`;
    link.click();
  };

  const filtered = creations.filter((item) => {
    if (filter === "all") return true;
    return (item.type || "").toLowerCase().includes(filter);
  });

  return (
    <div className="min-h-full p-6 lg:p-10 bg-[#f8fafc] dark:bg-[#0d0d0d] text-gray-900 dark:text-white transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Creations Library</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Browse and manage your saved AI articles, blog titles, code, and images
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["all", "article", "blog", "image", "resume"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  filter === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Loading your creations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 space-y-3">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto stroke-[1.5]" />
            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
              No saved creations found.
            </p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Generated articles, images, and tools will be archived here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => {
              const isImage = (item.type || "").includes("image") || (item.content || "").startsWith("data:image");
              return (
                <div
                  key={item.id || idx}
                  className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {item.type || "Creation"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                      {item.prompt || "AI Creation"}
                    </h3>

                    {isImage ? (
                      <div className="rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10">
                        <img
                          src={item.content}
                          alt="AI Creation"
                          className="w-full h-44 object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                        {item.content}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    {isImage ? (
                      <button
                        onClick={() => handleDownloadImage(item.content, item.prompt || "image")}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCopy(item.content, item.id || idx)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {copiedId === (item.id || idx) ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Text
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Library;
