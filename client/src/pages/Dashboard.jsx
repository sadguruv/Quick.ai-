import { useEffect, useState } from "react";
import { Gem, Sparkles, Zap, Clock } from "lucide-react";
import { Protect, useAuth, useUser } from "../auth/MockClerk";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import toast from "react-hot-toast";
import { useCreditsContext } from "../context/CreditsContext";
import { motion } from "framer-motion";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const { credits, role, loading: creditsLoading } = useCreditsContext();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();

  // Derive usage count from actual data
  const usageCount = creations.length;

  const getDashboardData = async () => {
    try {
      // Attempt to fetch real creations if backend supports it
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setCreations(data.creations);
      }
    } catch (error) {
      console.warn("Could not fetch creations history", error);
      // Don't show toast error here to avoid annoyance if backend is offline
    }
    setLoading(false);
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-6 lg:p-10 bg-[#f8fafc] dark:bg-[#0d0d0d] text-gray-900 dark:text-white transition-colors duration-300">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Usage Card */}
            <motion.div variants={item} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Creations</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{usageCount}</h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
            </motion.div>

            {/* Credits Card */}
            <motion.div variants={item} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available Credits</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {credits === Infinity || role === 'service_provider' || role === 'admin' ? (
                    <span className="text-2xl">Unlimited</span>
                  ) : (
                    creditsLoading ? "..." : credits
                  )}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                <Zap className="w-6 h-6" />
              </div>
            </motion.div>

            {/* Plan Card */}
            <motion.div variants={item} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Plan</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {user?.isAdmin ? "Admin Plan" : (user?.plan === 'monthly' || user?.plan === 'yearly') ? "Pro Plan" : "Free Plan"}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Gem className="w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Recent Activity
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : creations.length > 0 ? (
            <div className="space-y-4">
              {creations.map((item) => (
                <CreationItem key={item.id || Math.random()} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 opacity-50" />
              </div>
              <p>No recent activity found in database.</p>
              <p className="text-sm">Start creating to seem them here!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
