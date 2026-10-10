import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const ThemeToggle = ({ className = "", showLabel = false, size = "md" }) => {
  const { isDark, toggleTheme } = useTheme();

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 ${
        isDark
          ? "bg-[#212124] hover:bg-[#2e2e33] text-amber-300 border border-white/10 hover:border-white/20 shadow-sm"
          : "bg-gray-100 hover:bg-gray-200 text-indigo-600 border border-gray-200 hover:border-gray-300 shadow-sm"
      } ${className}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className={`${iconSizes[size] || "w-4 h-4"} text-amber-300 fill-amber-300/20`} />
        ) : (
          <Sun className={`${iconSizes[size] || "w-4 h-4"} text-amber-500 fill-amber-500/20`} />
        )}
      </motion.div>
      {showLabel && (
        <span className="text-xs font-medium tracking-wide select-none">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
