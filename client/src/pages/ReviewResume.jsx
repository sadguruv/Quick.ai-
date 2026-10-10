import { useState } from "react";
import { FileText, Sparkles, Upload, Check, X } from "lucide-react";
import { useAuth } from "../auth/MockClerk";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { useCreditsContext } from "../context/CreditsContext";
import { motion, AnimatePresence } from "framer-motion";
import { safeFetch } from "../lib/safeFetch";
import { ENDPOINTS } from "../config/endpoints";

const ReviewResume = () => {
  const { getToken } = useAuth();
  const { updateCredits, checkCredits } = useCreditsContext();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [alert, setAlert] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setAlert("Please upload a PDF file");
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      setAlert("File size must be under 2MB");
      return;
    }

    setAlert(null);
    setFile(selected);
    setContent("");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!checkCredits(10)) {
      setAlert("Insufficient credits. Please upgrade.");
      return;
    }

    if (!file) {
      setAlert("Please upload a resume");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", file);

      const token = await getToken();

      const { data, error } = await safeFetch(ENDPOINTS.resume, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (error) {
        setAlert(`${error.message} ${error.hint ? `(${error.hint})` : ''}`);
        return;
      }

      if (!data) {
        setAlert("System Error: No review received.");
        return;
      }

      const generatedContent = data.data?.content || data.content;
      setContent(generatedContent);

      const updatedCredits = data.data?.credits ?? data.credits;
      if (updatedCredits !== undefined) {
        updateCredits(updatedCredits);
      } else {
        updateCredits();
      }
      toast.success("Resume reviewed successfully!");

    } catch (error) {
      console.error("Resume Review Error:", error);
      setAlert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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
              <div className="bg-pink-500/10 p-2.5 rounded-xl text-pink-600 dark:text-pink-400">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Reviewer</h1>
            </div>

            <AnimatePresence>
              {alert && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 p-4 rounded-xl text-sm font-medium flex items-center gap-2 mb-4"
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

            <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#1f1f23] transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />

              {file ? (
                <div className="flex items-center gap-3 bg-pink-50 dark:bg-pink-500/10 px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-500/20">
                  <FileText className="w-8 h-8 text-pink-500" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); setFile(null); }}
                    className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors ml-2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ) : (
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-pink-500" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Upload your Resume (PDF)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max file size 2MB</p>
                </label>
              )}
            </div>

            <button
              onClick={onSubmitHandler}
              disabled={loading || !file}
              className="w-full mt-6 flex justify-center items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Review Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col h-full min-h-[500px]">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">ATS Feedback Report</h2>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar max-h-[600px] p-4 rounded-2xl bg-gray-50 dark:bg-[#121215] border border-gray-200 dark:border-white/5">
            <AnimatePresence mode="wait">
              {content ? (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-sans text-sm"
                >
                  <Markdown>{content}</Markdown>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500 py-16"
                >
                  <FileText className="w-12 h-12 opacity-50 mb-3" />
                  <p>Upload a resume to get instant ATS feedback</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewResume;
