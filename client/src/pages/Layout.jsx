import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { SignIn, useUser } from "../auth/MockClerk";
import { useCreditsContext } from "../context/CreditsContext";
import ThemeToggle from "../components/ThemeToggle";
import { Menu, Share2, Sparkles, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { credits } = useCreditsContext();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast.success("QuickAI link copied to clipboard!");
  };

  return user ? (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-[#0d0d0d] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Desktop & Mobile Responsive Sidebar */}
      <div className={`${mobileSidebar ? "fixed inset-0 z-50 flex" : "hidden md:flex shrink-0"}`}>
        {mobileSidebar && (
          <div
            onClick={() => setMobileSidebar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
        <div className="relative z-50 h-full">
          <Sidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            setSidebar={setMobileSidebar}
          />
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#f8fafc] dark:bg-[#0d0d0d]">
        {/* Top Minimalist Header */}
        <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0d0d0d] z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebar(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                QuickAI
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Ollama Active
              </span>
            </div>
          </div>

          {/* Right Header Controls: Share, Credits, ThemeToggle */}
          <div className="flex items-center gap-2.5">
            {/* Share Button */}
            <button
              onClick={handleShare}
              title="Share QuickAI"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Credits Pill */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-300">
              <span>🪙 {credits}</span>
            </div>

            {/* Handy Dark / Light Theme Toggle in Top Bar */}
            <ThemeToggle showLabel={false} size="md" />

            {/* Admin Panel Quick Link */}
            {user?.isAdmin && (
              <button
                onClick={() => navigate("/ai/admin-panel")}
                title="Admin Control Panel"
                className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-[#f8fafc] dark:bg-[#0d0d0d] text-gray-900 dark:text-white">
      <SignIn />
    </div>
  );
};

export default Layout;
