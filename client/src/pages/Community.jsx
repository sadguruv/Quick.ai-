import { useAuth, useUser } from "../auth/MockClerk";
import { useEffect, useState } from "react";
import { 
  Heart, Zap, Check, Rocket, Search, MessageSquare, ThumbsUp, 
  CheckCircle2, ChevronRight, ArrowLeft, ShieldAlert, Sparkles, 
  Tag, Plus, Send, Lock, Image, FileText, Terminal, User
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const plans = [
  {
    name: "Pro Monthly",
    price: "$9",
    period: "/ month",
    features: ["Unlimited AI generations", "Priority support", "Access to all tools", "5GB storage"],
    cta: "Get Monthly Plan",
    dark: false,
    badge: null,
  },
  {
    name: "Pro Yearly",
    price: "$79",
    period: "/ year",
    features: ["Everything in Monthly", "Priority support", "Early access features", "100GB storage"],
    cta: "Get Yearly Plan",
    dark: true,
    badge: "Best Value",
  },
];

const categories = [
  { name: "All", icon: Sparkles, color: "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10" },
  { name: "Account Access & Credits", icon: Lock, color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20" },
  { name: "AI Image Generation", icon: Image, color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20" },
  { name: "AI Writing & Articles", icon: FileText, color: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20" },
  { name: "API Integration", icon: Terminal, color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20" },
  { name: "General Discussion", icon: MessageSquare, color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20" }
];

const Community = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState("forum");
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General Discussion"
  });
  
  const [newReplyContent, setNewReplyContent] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get("/api/user/community/posts", {
        params: {
          category: selectedCategory,
          search: debouncedSearch
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Fetch posts failed:", error);
      toast.error(error.response?.data?.message || "Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetail = async (postId) => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`/api/user/community/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedPost(response.data.post);
        setReplies(response.data.replies);
      }
    } catch (error) {
      console.error("Fetch post details failed:", error);
      toast.error(error.response?.data?.message || "Failed to load thread details");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      return toast.error("Please fill in both the title and content fields.");
    }
    
    try {
      setSubmitting(true);
      const token = await getToken();
      const response = await axios.post("/api/user/community/posts", newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Question posted successfully!");
        setShowAskModal(false);
        setNewPost({ title: "", content: "", category: "General Discussion" });
        fetchPosts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (postId, e) => {
    if (e) e.stopPropagation();
    try {
      const token = await getToken();
      const response = await axios.post(`/api/user/community/posts/${postId}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({ ...selectedPost, upvotes: response.data.upvotes });
        }
        setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: response.data.upvotes } : p));
        toast.success(response.data.upvotes.includes(user?.id) ? "Upvoted!" : "Removed upvote");
      }
    } catch (error) {
      toast.error("Failed to toggle upvote");
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!newReplyContent.trim()) return;
    
    try {
      setSubmitting(true);
      const token = await getToken();
      const response = await axios.post(`/api/user/community/posts/${selectedPost.id}/reply`, {
        content: newReplyContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Reply added!");
        setNewReplyContent("");
        fetchPostDetail(selectedPost.id);
      }
    } catch (error) {
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecommendReply = async (replyId) => {
    try {
      const token = await getToken();
      const response = await axios.post(`/api/user/community/replies/${replyId}/recommend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchPostDetail(selectedPost.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to recommend answer");
    }
  };

  useEffect(() => {
    if (user && activeTab === "forum" && !selectedPost) {
      fetchPosts();
    }
  }, [user, activeTab, selectedCategory, debouncedSearch, selectedPost]);

  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=1a73e8&color=fff&bold=true&size=40`;
  };

  const getBadgeStyle = (role, plan) => {
    if (role === "admin") {
      return { label: "Admin", style: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20" };
    }
    if (plan === "yearly" || plan === "monthly") {
      return { label: "Pro User", style: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" };
    }
    return { label: "Member", style: "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10" };
  };

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-[#0d0d0d] overflow-y-auto no-scrollbar text-gray-900 dark:text-white font-sans flex flex-col transition-colors duration-300">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-[#141417] dark:to-[#18181b] border-b border-gray-200 dark:border-white/10 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight"
          >
            QuickAI Help Community
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 mb-8 text-base max-w-lg mx-auto leading-relaxed"
          >
            Search for answers, post questions, or share tips with our content creators.
          </motion.p>
          
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto shadow-md rounded-full bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10">
            <Search className="absolute left-5 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Describe your issue or search the community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
            />
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#121215] sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex gap-8">
          <button
            onClick={() => { setActiveTab("forum"); setSelectedPost(null); }}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "forum"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Help Community
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "plans"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Upgrade & Plans
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6">
        
        {/* TAB 1: HELP COMMUNITY FORUM */}
        {activeTab === "forum" && (
          <div>
            {!selectedPost ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Column: Categories list */}
                <div className="lg:col-span-1 space-y-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Categories</h3>
                  {categories.map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                          isSelected 
                            ? "bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                            : "bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className={`p-1.5 rounded-md ${cat.color} border`}>
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Q&A Threads List */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Ask community card */}
                  <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Can't find what you're looking for?</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ask the Help Community and get support from other members and administrators.</p>
                    </div>
                    <button
                      onClick={() => setShowAskModal(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Ask now
                    </button>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {selectedCategory === "All" ? "Recent Discussions" : `${selectedCategory} Threads`}
                    </h2>
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-full">
                      {posts.length} {posts.length === 1 ? "thread" : "threads"}
                    </span>
                  </div>

                  {/* Threads list */}
                  {loading ? (
                    <div className="flex justify-center items-center py-20 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                      <span className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => {
                        const authorBadge = getBadgeStyle(post.author_role, post.author_plan);
                        const isUpvoted = post.upvotes?.includes(user?.id);
                        
                        return (
                          <motion.div
                            key={post.id}
                            whileHover={{ y: -2 }}
                            onClick={() => fetchPostDetail(post.id)}
                            className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row gap-4 justify-between"
                          >
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/20">
                                  {post.category}
                                </span>
                                
                                {post.author_role === "admin" && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-full">
                                    <CheckCircle2 className="w-3.5 h-3.5 fill-green-100 dark:fill-green-500/20" /> Resolved by Support
                                  </span>
                                )}
                              </div>

                              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {post.title}
                              </h3>

                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                {post.content}
                              </p>

                              <div className="flex items-center gap-2.5 pt-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                                <img
                                  src={getAvatarUrl(post.author_name || post.user_id)}
                                  alt={post.author_name || "User"}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  {post.author_name || post.user_id.split('@')[0]}
                                </span>
                                <span className={`px-1.5 py-0.5 text-[10px] font-bold border rounded ${authorBadge.style}`}>
                                  {authorBadge.label}
                                </span>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                              </div>
                            </div>

                            <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 md:border-l border-gray-100 dark:border-white/5 md:pl-6 pt-3 md:pt-0 min-w-[100px] border-t md:border-t-0">
                              <button
                                onClick={(e) => handleUpvote(post.id, e)}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                                  isUpvoted
                                    ? "bg-blue-50 dark:bg-blue-500/20 border-blue-200 text-blue-600 dark:text-blue-400"
                                    : "bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10"
                                }`}
                              >
                                <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-blue-500 text-blue-600" : ""}`} />
                                <span>{post.upvotes?.length || 0}</span>
                              </button>

                              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{post.id % 2 === 1 ? 2 : 1} replies</span>
                              </div>
                            </div>

                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-16 text-center text-gray-500 shadow-sm">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">No threads found in this category.</p>
                      <p className="text-sm mt-1">Be the first to ask a question under "{selectedCategory}"!</p>
                      <button 
                        onClick={() => setShowAskModal(true)}
                        className="mt-4 px-5 py-2 bg-blue-600 text-white font-medium rounded-full text-sm shadow hover:bg-blue-700 transition-colors"
                      >
                        Post a question
                      </button>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              /* DETAILED THREAD VIEW */
              <div className="max-w-4xl mx-auto space-y-6">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to help community
                </button>

                <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(selectedPost.author_name || selectedPost.user_id)}
                        alt={selectedPost.author_name || "User"}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {selectedPost.author_name || selectedPost.user_id.split('@')[0]}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold border rounded ${getBadgeStyle(selectedPost.author_role, selectedPost.author_plan).style}`}>
                            {getBadgeStyle(selectedPost.author_role, selectedPost.author_plan).label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Posted on {new Date(selectedPost.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                        </span>
                      </div>
                    </div>
                    
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 rounded-full">
                      {selectedPost.category}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white">
                    {selectedPost.title}
                  </h2>

                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                    {selectedPost.content}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
                    <button
                      onClick={() => handleUpvote(selectedPost.id)}
                      className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                        selectedPost.upvotes?.includes(user?.id)
                          ? "bg-blue-50 dark:bg-blue-500/20 border-blue-200 text-blue-600 dark:text-blue-400"
                          : "bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10"
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${selectedPost.upvotes?.includes(user?.id) ? "fill-blue-500 text-blue-600" : ""}`} />
                      <span>Helpful ({selectedPost.upvotes?.length || 0})</span>
                    </button>
                    
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {replies.length} {replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider px-1">Replies</h3>

                <div className="space-y-4">
                  {replies.length > 0 ? (
                    replies.map((reply) => {
                      const replyBadge = getBadgeStyle(reply.author_role, reply.author_plan);
                      const isRecommended = reply.is_recommended === 1;
                      
                      return (
                        <div
                          key={reply.id}
                          className={`rounded-2xl p-5 border transition-all ${
                            isRecommended
                              ? "bg-green-50/50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 shadow-sm"
                              : "bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/10"
                          }`}
                        >
                          {isRecommended && (
                            <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-semibold text-xs mb-3">
                              <CheckCircle2 className="w-4 h-4 text-green-600 fill-green-100 dark:fill-green-500/20" /> Recommended Answer
                            </div>
                          )}

                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={getAvatarUrl(reply.author_name || reply.user_id)}
                                alt={reply.author_name || "User"}
                                className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 object-cover"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {reply.author_name || reply.user_id.split('@')[0]}
                                  </span>
                                  <span className={`px-1.5 py-0.5 text-[9px] font-bold border rounded ${replyBadge.style}`}>
                                    {replyBadge.label}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  Replied {new Date(reply.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                </span>
                              </div>
                            </div>

                            {user?.isAdmin && (
                              <button
                                onClick={() => handleRecommendReply(reply.id)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all ${
                                  isRecommended
                                    ? "bg-red-50 dark:bg-red-500/10 border-red-200 text-red-600 hover:bg-red-100"
                                    : "bg-green-50 dark:bg-green-500/10 border-green-200 text-green-700 hover:bg-green-100"
                                }`}
                              >
                                {isRecommended ? "Remove Recommended" : "Mark Recommended"}
                              </button>
                            )}
                          </div>

                          <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-line pl-11">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center text-gray-500 shadow-sm">
                      <p className="font-semibold text-sm">No replies yet.</p>
                      <p className="text-xs mt-0.5">Be the first to help this member by leaving a reply below!</p>
                    </div>
                  )}
                </div>

                {/* Write Reply Form */}
                <form onSubmit={handlePostReply} className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Post a reply</h4>
                  <div className="flex gap-3">
                    <img
                      src={getAvatarUrl(user?.fullName)}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 space-y-3">
                      <textarea
                        placeholder="Write your answer or suggestion here..."
                        value={newReplyContent}
                        onChange={(e) => setNewReplyContent(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1f1f23]"
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting || !newReplyContent.trim()}
                          className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-semibold transition-colors shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submitting ? "Posting..." : "Post reply"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

              </div>
            )}
          </div>
        )}

        {/* TAB 2: UPGRADE PLAN CARDS */}
        {activeTab === "plans" && (
          <div className="py-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                Premium Access Tiers
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white mb-2">Upgrade to Pro</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Unlock unlimited credits, faster response times, and premium tool sets. Cancel anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  whileHover={{ y: -5 }}
                  className={`relative rounded-3xl p-8 text-left flex flex-col shadow-md border ${
                    plan.dark
                      ? "bg-slate-900 border-slate-800 text-white"
                      : "bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute top-0 right-0 bg-amber-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-3xl uppercase tracking-wider border-b border-l border-amber-500">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-3.5 flex-1 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-xs sm:text-sm">
                        <Check className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => toast.success("Payment integration coming soon!")}
                    className="w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Rocket className="w-4 h-4" />
                    {plan.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── ASK QUESTION MODAL DIALOG ── */}
      <AnimatePresence>
        {showAskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#18181b] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="border-b border-gray-100 dark:border-white/10 px-6 py-4 bg-gray-50 dark:bg-[#141417] flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Ask the community
                </h3>
                <button
                  onClick={() => setShowAskModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1f1f23]"
                  >
                    {categories.filter(c => c.name !== "All").map((c) => (
                      <option key={c.name} value={c.name} className="bg-white dark:bg-[#18181b]">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title / Subject</label>
                  <input
                    type="text"
                    placeholder="Be specific. For example: How do I generate articles with Ollama?"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1f1f23]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Question details</label>
                  <textarea
                    placeholder="Describe your issue, including any details that could help the community answer your question..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={5}
                    className="w-full border border-gray-300 dark:border-white/10 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1f1f23]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-300 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-sm"
                  >
                    {submitting ? "Posting..." : "Post question"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
