import { useEffect, useState } from "react";
import { useAuth, useUser } from "../auth/MockClerk";
import { Users, Trash2, Plus, Edit2, ShieldAlert, Award, Star, Zap, UserPlus, Check, Activity, Sparkles, Copy } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AdminPanel = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add User Form State
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "user",
    plan: "free",
    credits: 1000
  });

  // Credit Edit State
  const [editingUserId, setEditingUserId] = useState(null);
  const [editCreditsAmount, setEditCreditsAmount] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [creationsList, setCreationsList] = useState([]);

  const fetchCreations = async () => {
    try {
      const token = await getToken();
      const response = await axios.get("/api/user/admin/creations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCreationsList(response.data.creations);
      }
    } catch (error) {
      console.error("Fetch creations failed:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get("/api/user/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsersList(response.data.users);
      }
    } catch (error) {
      console.error("Fetch users failed:", error);
      toast.error(error.response?.data?.message || "Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      return toast.error("Please fill in all required fields.");
    }

    try {
      const token = await getToken();
      const response = await axios.post("/api/user/admin/users", newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("User added successfully!");
        setShowAddForm(false);
        setNewUser({ email: "", password: "", fullName: "", role: "user", plan: "free", credits: 1000 });
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? All their history will be dropped.")) return;

    try {
      const token = await getToken();
      const response = await axios.delete(`/api/user/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("User deleted successfully!");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateCredits = async (userId) => {
    if (!editCreditsAmount || isNaN(editCreditsAmount)) {
      return toast.error("Please enter a valid number");
    }

    try {
      const token = await getToken();
      const response = await axios.post(`/api/user/admin/users/${userId}/credits`, {
        credits: Number(editCreditsAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Credits updated successfully!");
        setEditingUserId(null);
        setEditCreditsAmount("");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to update credits");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.email || !editingUser.fullName) {
      return toast.error("Please fill in Name and Email.");
    }

    try {
      const token = await getToken();
      const response = await axios.put(`/api/user/admin/users/${editingUser.id}`, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        role: editingUser.role,
        plan: editingUser.plan,
        credits: editingUser.credits,
        password: editingUser.password || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("User updated successfully!");
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
      fetchCreations();
    }
  }, [user]);

  if (!user?.isAdmin) {
    return (
      <div className="flex h-full items-center justify-center p-6 bg-[#F4F7FB]">
        <div className="text-center space-y-4 bg-white border border-gray-200 rounded-3xl p-10 max-w-md shadow-sm">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 text-sm">Only system administrators can access the Control Panel.</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalUsers = usersList.length;
  const totalCredits = usersList.reduce((sum, u) => sum + (u.credits || 0), 0);

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-6 lg:p-10 bg-[#F8F9FA] text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-indigo-600" /> Admin Control Panel
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage platform accounts, edit credits, and configure system plans.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-100"
          >
            <UserPlus className="w-4 h-4" /> Add New User
          </button>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users Registered</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{totalUsers}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total System Credits</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{totalCredits}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Moves / Actions</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{creationsList.length}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Add User Panel Modal-style */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden"
            >
              <h3 className="text-lg font-bold text-gray-950 mb-4">Create New Account</h3>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Initial Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Initial Credits</label>
                  <input
                    type="number"
                    value={newUser.credits}
                    onChange={(e) => setNewUser({...newUser, credits: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Platform Plan</label>
                  <select
                    value={newUser.plan}
                    onChange={(e) => setNewUser({...newUser, plan: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="free">Free Starter Plan</option>
                    <option value="monthly">Pro Monthly</option>
                    <option value="yearly">Pro Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Account Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-end justify-end md:col-span-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 bg-white text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Save Account
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-150">
            <h3 className="font-bold text-gray-950 text-base">Users and Credits Log</h3>
          </div>
          
          {loading && usersList.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <span className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          ) : usersList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-bold">
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Plan Level</th>
                    <th className="px-6 py-3.5">Credit Balance</th>
                    <th className="px-6 py-3.5">Sign Up Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {usersList.map((usr) => {
                    const isPro = usr.plan === "monthly" || usr.plan === "yearly";
                    
                    return (
                      <tr key={usr.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{usr.fullName}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono">{usr.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isPro
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {isPro ? <Star className="w-3 h-3 fill-amber-500" /> : <Award className="w-3 h-3 text-blue-500" />}
                            {usr.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {editingUserId === usr.id ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                value={editCreditsAmount}
                                onChange={(e) => setEditCreditsAmount(e.target.value)}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white"
                                placeholder={usr.credits}
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateCredits(usr.id)}
                                className="p-1.5 bg-green-50 text-green-600 rounded border border-green-200 hover:bg-green-100"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-semibold text-gray-800">
                                {isPro ? "Unlimited (Pro)" : usr.credits}
                              </span>
                              {!isPro && (
                                <button
                                  onClick={() => {
                                    setEditingUserId(usr.id);
                                    setEditCreditsAmount(usr.credits.toString());
                                  }}
                                  className="text-gray-400 hover:text-indigo-600 p-1"
                                  title="Edit credits"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(usr.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => setEditingUser({
                              id: usr.id,
                              fullName: usr.fullName,
                              email: usr.email,
                              role: usr.role || 'user',
                              plan: usr.plan || 'free',
                              credits: usr.credits || 0,
                              password: ""
                            })}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                            title="Edit user completely"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Drop account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-semibold text-base">No user accounts found.</p>
              <p className="text-sm mt-0.5">Use the "Add New User" button to register accounts.</p>
            </div>
          )}
        </div>

        {/* Recent Activity / Moves Log */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" /> Recent Application moves (User Actions)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Real-time log of creations and tool outputs across the application.</p>
            </div>
            <button
              onClick={fetchCreations}
              className="px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" /> Refresh Activities
            </button>
          </div>

          {creationsList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-150 text-gray-500 font-bold">
                    <th className="px-6 py-3.5">User Profile</th>
                    <th className="px-6 py-3.5">Action Executed</th>
                    <th className="px-6 py-3.5">User Prompt / Input</th>
                    <th className="px-6 py-3.5">Output Data Preview</th>
                    <th className="px-6 py-3.5">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {creationsList.map((item) => {
                    const isImage = item.type === "image";
                    const isLongText = item.content && item.content.length > 180;
                    
                    return (
                      <tr key={item.id || Math.random()} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{item.userName || "Guest / Anonymous"}</div>
                          <div className="text-xs text-gray-500 font-mono">{item.userEmail || item.user_id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isImage
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            {isImage ? <Sparkles className="w-3 h-3 text-purple-500" /> : <Activity className="w-3 h-3 text-emerald-500" />}
                            {item.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-medium max-w-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate" title={item.prompt}>{item.prompt}</span>
                            <button
                              onClick={() => handleCopy(item.prompt)}
                              className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-gray-150 transition-colors shrink-0"
                              title="Copy prompt text"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-md text-gray-500">
                          <div className="flex items-center justify-between gap-2">
                            {isImage ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.content}
                                  alt="Generated Move"
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => {
                                    const w = window.open();
                                    if (w) w.document.write(`<img src="${item.content}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                                  }}
                                />
                                <span className="text-xs text-gray-400 italic">Image Move</span>
                              </div>
                            ) : (
                              <span className="font-mono text-xs text-gray-650 truncate" title={item.content}>
                                {isLongText ? `${item.content.substring(0, 160)}...` : item.content}
                              </span>
                            )}
                            <button
                              onClick={() => handleCopy(item.content)}
                              className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-gray-150 transition-colors shrink-0"
                              title={isImage ? "Copy Image Base64 Data URI" : "Copy output text content"}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                          {new Date(item.created_at || item.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-semibold text-base">No moves logged in database.</p>
              <p className="text-sm mt-0.5">When users run AI actions (Image, Resume, Blog), they will show here.</p>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        <AnimatePresence>
          {editingUser && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-200 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 relative"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-950">Edit User Account</h3>
                  <p className="text-gray-500 text-xs mt-1">Modify user profile, credentials, plan, and credits.</p>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingUser.fullName}
                      onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Credits Balance</label>
                      <input
                        type="number"
                        required
                        value={editingUser.credits}
                        onChange={(e) => setEditingUser({ ...editingUser, credits: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Platform Plan</label>
                    <select
                      value={editingUser.plan}
                      onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                      <option value="free">Free Starter Plan</option>
                      <option value="monthly">Pro Monthly</option>
                      <option value="yearly">Pro Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                      New Password (Plain Text - visible to admin)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to keep current password"
                      value={editingUser.password}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 bg-white text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AdminPanel;
