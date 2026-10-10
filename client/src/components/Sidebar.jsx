import React, { useState, useEffect } from "react";
import {
  MessageSquarePlus,
  FolderOpen,
  FolderKanban,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trash2,
  MessageSquare
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../auth/MockClerk";
import { useRole } from "../context/RoleContext";
import { useCreditsContext } from "../context/CreditsContext";
import ThemeToggle from "./ThemeToggle";

const SESSIONS_STORAGE_KEY = "quickai_chat_sessions";
const ACTIVE_SESSION_ID_KEY = "quickai_active_session_id";

const Sidebar = ({ isCollapsed, setIsCollapsed, setSidebar }) => {
  const { user } = useUser();
  const { logout } = useRole();
  const { credits } = useCreditsContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const loadChatSessions = () => {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setChatSessions(list);
      const activeId = localStorage.getItem(ACTIVE_SESSION_ID_KEY);
      setActiveSessionId(activeId || (list[0]?.id ?? null));
    } catch (e) {
      console.error("Failed to read chat sessions:", e);
    }
  };

  useEffect(() => {
    loadChatSessions();

    const handleSessionsUpdate = () => {
      loadChatSessions();
    };

    window.addEventListener("quickai_sessions_updated", handleSessionsUpdate);
    return () => {
      window.removeEventListener("quickai_sessions_updated", handleSessionsUpdate);
    };
  }, []);

  const handleNewChat = () => {
    navigate("/ai");
    window.dispatchEvent(new Event("quickai_new_chat"));
    if (setSidebar) setSidebar(false);
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, sessionId);
    navigate("/ai");
    window.dispatchEvent(new CustomEvent("quickai_load_session", { detail: { id: sessionId } }));
    if (setSidebar) setSidebar(false);
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((s) => s.id !== sessionId);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(list));
      setChatSessions(list);

      if (activeSessionId === sessionId) {
        if (list.length > 0) {
          handleSelectSession(list[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {}
  };

  const topNavItems = [
    { label: "Library", icon: FolderOpen, to: "/ai/library" },
    { label: "Projects", icon: FolderKanban, to: "/ai/dashboard" },
    { label: "Community", icon: Puzzle, to: "/ai/community" },
  ];

  return (
    <aside
      className={`h-full bg-white dark:bg-[#000000] text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-white/10 flex flex-col justify-between transition-all duration-300 select-none z-40 ${
        isCollapsed ? "w-16" : "w-64 sm:w-68"
      }`}
    >
      {/* Top Section: Brand Header & New Chat */}
      <div className="flex flex-col p-3 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                QuickAI <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-blue-400">Go</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 transition-colors text-sm font-medium"
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0 text-indigo-600 dark:text-white" />
          {!isCollapsed && <span>New chat</span>}
        </button>

        {/* Navigation Shortcuts */}
        <div className="space-y-0.5 pt-1">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Middle Section: Real Chat Conversation History */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Recent Chats</span>
            <span className="text-[10px] lowercase font-normal">{chatSessions.length} chats</span>
          </div>

          {chatSessions.length === 0 ? (
            <div className="px-3 py-4 text-xs text-gray-400 dark:text-gray-500 italic">
              No chat history yet. Send a message to start!
            </div>
          ) : (
            chatSessions.map((session) => {
              const isSelected = activeSessionId === session.id && location.pathname === "/ai";
              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  title={session.title}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-gray-100 dark:bg-[#1e1e24] text-gray-900 dark:text-white font-semibold shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{session.title || "Conversation"}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    title="Delete chat"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bottom Section: User Profile Pill & Handy Theme Toggle */}
      <div className="p-3 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-gray-50 dark:bg-[#141417] border border-gray-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
              {user?.fullName?.charAt(0) || "S"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">
                  {user?.fullName || "Sadguru V"}
                </p>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {user?.isAdmin ? "Admin" : "Go Member"} • {credits} credits
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle size="sm" />
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
