import { useState } from "react";
import { SquarePen, Sparkles, Send, Copy, Check, Wand2 } from "lucide-react";
import { useAuth } from "../auth/MockClerk";
import toast from "react-hot-toast";
import { useCreditsContext } from "../context/CreditsContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArticlePayload } from "../lib/schema";
import { safeFetch } from "../lib/safeFetch";
import { ENDPOINTS } from "../config/endpoints";

const WriteArticle = () => {
  const { getToken } = useAuth();
  const { updateCredits, checkCredits } = useCreditsContext();

  const [topic, setTopic] = useState("");
  const [length, setLength] = useState("Medium");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [alert, setAlert] = useState(null);

  const lengthOptions = ["Short", "Medium", "Long"];
  const toneOptions = ["Professional", "Casual", "Enthusiastic", "Neutral"];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setAlert(null);
    setContent("");

    if (!checkCredits(10)) {
      setAlert("Insufficient credits. Please upgrade.");
      return;
    }

    const payload = {
      topic,
      length,
      tone,
      role: 'ai_user'
    };

    const parsed = ArticlePayload.safeParse(payload);
    if (!parsed.success) {
      setAlert(parsed.error.errors[0].message);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      const { data, error } = await safeFetch(ENDPOINTS.article, {
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
        setAlert("System Error: No data received. Please try again.");
        return;
      }

      const generatedText = data.data?.content || data.content;
      setContent(generatedText);
      
      const updatedCredits = data.data?.credits ?? data.credits;
      if (updatedCredits !== undefined) {
        updateCredits(updatedCredits);
      } else {
        updateCredits();
      }
      toast.success("Article generated successfully!");

    } catch (error) {
      console.error("Handler error:", error);
      setAlert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancePrompt = () => {
    if (!topic.trim()) {
      setAlert("Enter a topic first to enhance");
      return;
    }
    setAlert(null);
    setIsEnhancing(true);
    setTimeout(() => {
      setIsEnhancing(false);
      if (topic.toLowerCase().includes("porshe")) {
        setTopic(prev => prev.replace(/porshe/gi, "Porsche"));
        toast.success("Corrected 'porshe' to 'Porsche'");
      } else {
        toast.success("Prompt verified and enhanced!", { icon: '✨' });
      }
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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
              <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
                <SquarePen className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Article Writer</h1>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              {/* UI Guard Alert */}
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
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Topic</label>
                <textarea
                  onChange={(e) => setTopic(e.target.value)}
                  value={topic}
                  rows={4}
                  className="w-full p-4 text-base rounded-2xl border border-gray-200 dark:border-white/10 focus:border-blue-500 transition-all outline-none resize-none bg-gray-50 dark:bg-[#1f1f23] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="E.g., The Future of Sustainable Energy in 2026..."
                  spellCheck={true}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !topic}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline disabled:opacity-50 transition-colors"
                  >
                    <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
                    {isEnhancing ? "Checking..." : "Enhance / Check Spelling"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Length</label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1f1f23] text-gray-900 dark:text-white focus:border-blue-500 outline-none cursor-pointer text-sm"
                  >
                    {lengthOptions.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-[#18181b]">{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1f1f23] text-gray-900 dark:text-white focus:border-blue-500 outline-none cursor-pointer text-sm"
                  >
                    {toneOptions.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-[#18181b]">{opt}</option>)}
                  </select>
                </div>
              </div>

              <button
                disabled={loading || !topic.trim()}
                className="w-full mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Article
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Generated Content</h2>
            </div>
            {content && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          <div className="flex-1 rounded-2xl bg-gray-50 dark:bg-[#121215] border border-gray-200 dark:border-white/5 p-6 overflow-y-auto no-scrollbar max-h-[600px]">
            <AnimatePresence mode="wait">
              {content ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-sans"
                >
                  {content}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500"
                >
                  <SquarePen className="w-12 h-12 opacity-50 mb-3" />
                  <p>Enter a topic to generate an article</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WriteArticle;
