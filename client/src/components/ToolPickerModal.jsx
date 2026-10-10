import React, { useState, useEffect, useRef } from "react";
import {
  Paperclip,
  FolderOpen,
  Image,
  Globe,
  Search,
  FileText,
  Hash,
  Eraser,
  Sparkles,
  Wand2,
  Code,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALL_TOOLS = [
  {
    id: "upload_file",
    title: "Add photos & files",
    description: "Upload from computer",
    icon: Paperclip,
    color: "text-blue-500 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/10",
    action: "file_upload",
  },
  {
    id: "library",
    title: "Add from library",
    description: "Browse and search your files",
    icon: FolderOpen,
    color: "text-amber-500 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/10",
    action: "library",
  },
  {
    id: "create_image",
    title: "Create image",
    description: "Visualize anything",
    icon: Image,
    color: "text-emerald-500 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10",
    action: "create_image",
    badge: "AI Studio",
  },
  {
    id: "web_search",
    title: "Web search",
    description: "Find real-time news and info",
    icon: Globe,
    color: "text-cyan-500 bg-cyan-500/10 dark:text-cyan-400 dark:bg-cyan-500/10",
    action: "web_search",
  },
  {
    id: "deep_research",
    title: "Deep research",
    description: "Get a detailed report",
    icon: Search,
    color: "text-indigo-500 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/10",
    action: "deep_research",
  },
  {
    id: "write_article",
    title: "Write Article",
    description: "Long-form structured writing with Ollama",
    icon: FileText,
    color: "text-violet-500 bg-violet-500/10 dark:text-violet-400 dark:bg-violet-500/10",
    action: "write_article",
    badge: "Ollama",
  },
  {
    id: "blog_titles",
    title: "Blog Titles",
    description: "Viral headlines & outline generator",
    icon: Hash,
    color: "text-rose-500 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/10",
    action: "blog_titles",
    badge: "Ollama",
  },
  {
    id: "remove_background",
    title: "Remove Background",
    description: "Extract subject using Python Rembg",
    icon: Eraser,
    color: "text-orange-500 bg-orange-500/10 dark:text-orange-400 dark:bg-orange-500/10",
    action: "remove_background",
    badge: "Rembg",
  },
  {
    id: "review_resume",
    title: "Review Resume",
    description: "ATS scoring & career advice",
    icon: Sparkles,
    color: "text-fuchsia-500 bg-fuchsia-500/10 dark:text-fuchsia-400 dark:bg-fuchsia-500/10",
    action: "review_resume",
    badge: "ATS AI",
  },
  {
    id: "stable_diffusion",
    title: "Stable Diffusion",
    description: "High-end local image synthesis",
    icon: Wand2,
    color: "text-pink-500 bg-pink-500/10 dark:text-pink-400 dark:bg-pink-500/10",
    action: "stable_diffusion",
  },
  {
    id: "codex",
    title: "AI Codex Studio",
    description: "Write, debug, explain & refactor code",
    icon: Code,
    color: "text-teal-500 bg-teal-500/10 dark:text-teal-400 dark:bg-teal-500/10",
    action: "codex",
    badge: "Ollama",
  },
];

const ToolPickerModal = ({ isOpen, onClose, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const filteredTools = ALL_TOOLS.filter((tool) =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="absolute bottom-full left-0 mb-3 w-[360px] sm:w-[420px] max-h-[520px] bg-white dark:bg-[#1a1a1e] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col backdrop-blur-xl"
      >
        {/* Tool List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1 max-h-[440px]">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No matching skills or plugins found.
            </div>
          ) : (
            filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    onSelectTool(tool);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-150 group text-left"
                >
                  <div className={`p-2 rounded-xl ${tool.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-white">
                        {tool.title}
                      </span>
                      {tool.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {tool.description}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Search Bar at Bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#141417] flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search plugins, files, folders & skills"
            className="w-full bg-transparent text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToolPickerModal;
