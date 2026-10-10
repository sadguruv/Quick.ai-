import { useState } from "react";
import { Hash, Sparkles, Copy, Check } from "lucide-react";
import { useAuth } from "../auth/MockClerk";
import toast from "react-hot-toast";
import { useCreditsContext } from "../context/CreditsContext";
import { motion, AnimatePresence } from "framer-motion";
import { TitlePayload } from "../lib/schema";
import { safeFetch } from "../lib/safeFetch";
import { ENDPOINTS } from "../config/endpoints";

const BlogTitles = () => {
  const { getToken } = useAuth();
  const { updateCredits, checkCredits } = useCreditsContext();

  const [category, setCategory] = useState("Technology");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [alert, setAlert] = useState(null);

  const categories = ["Technology", "Health", "Business", "Lifestyle", "Education"];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setAlert(null);
    setTitles([]);

    if (!checkCredits(10)) {
      setAlert("Insufficient credits. Please upgrade.");
      return;
    }

    const payload = { category, keyword };
    const parsed = TitlePayload.safeParse(payload);
    if (!parsed.success) {
      setAlert(parsed.error.errors[0].message);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      const { data, error } = await safeFetch(ENDPOINTS.titles, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(parsed.data),
      });

      if (error) {
        setAlert(`${error.message} ${error.hint ? `(${error.hint})` : ''}`);
        return;
      }

      if (!data) {
        setAlert("System Error: No data received.");
        return;
      }

      const rawContent = data.data?.content || data.content;
      const content = typeof rawContent === 'string'
        ? rawContent.split('\n').filter(t => t.trim().length > 0)
        : rawContent;

      setTitles(content);
      const updatedCredits = data.data?.credits ?? data.credits;
      if (updatedCredits !== undefined) {
        updateCredits(updatedCredits);
      } else {
        updateCredits();
      }
      toast.success("Titles generated!");

    } catch (error) {
      console.error("Blog Title Handler Error:", error);
      setAlert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-full p-6 lg:p-10 bg-[#f8fafc] dark:bg-[#0d0d0d] text-gray-900 dark:text-white transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-500/10 p-2.5 rounded-xl text-yellow-600 dark:text-yellow-400">
                <Hash className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Title Generator</h1>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              <AnimatePresence>
                {alert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 p-4 rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="flex-1">{alert}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onSubmitHandler({ preventDefault: () => { } });
                      }}
                      className="bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-lg text-xs font-bold transition-colors ml-2 flex-shrink-0"
                    >
                      Retry ↻
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1f1f23] text-gray-900 dark:text-white focus:border-yellow-500 outline-none cursor-pointer text-sm"
                >
                  {categories.map(cat => <option key={cat} value={cat} className="bg-white dark:bg-[#18181b]">{cat}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Keyword / Topic</label>
                <input
                  type="text"
                  onChange={(e) => setKeyword(e.target.value)}
                  value={keyword}
                  className="w-full p-3.5 rounded-2xl border border-gray-200 dark:border-white/10 focus:border-yellow-500 transition-all outline-none bg-gray-50 dark:bg-[#1f1f23] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  placeholder="E.g., Sustainable energy, Machine learning..."
                />
              </div>

              <button
                disabled={loading || !keyword.trim()}
                className="w-full mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-yellow-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Titles
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col h-full min-h-[500px]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Generated Headlines
          </h2>

          <div className="flex-1 rounded-2xl bg-gray-50 dark:bg-[#121215] border border-gray-200 dark:border-white/5 p-4 overflow-y-auto no-scrollbar max-h-[600px] space-y-2.5">
            {titles.length > 0 ? (
              titles.map((title, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 hover:border-yellow-400/50 transition-all group"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 pr-3">
                    {title}
                  </p>
                  <button
                    onClick={() => handleCopy(title, idx)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-yellow-500 transition-colors shrink-0"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500 py-16">
                <Hash className="w-12 h-12 opacity-50 mb-3" />
                <p>Enter keywords to generate viral headlines</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogTitles;
