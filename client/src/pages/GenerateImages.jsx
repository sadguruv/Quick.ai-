import { useState } from "react";
import { Image, Sparkles, Download, Wand2, Eraser } from "lucide-react";
import { useAuth } from "../auth/MockClerk";
import toast from "react-hot-toast";
import { useCreditsContext } from "../context/CreditsContext";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePayload } from "../lib/schema";
import { safeFetch } from "../lib/safeFetch";
import { ENDPOINTS } from "../config/endpoints";

const GenerateImages = () => {
  const { getToken } = useAuth();
  const { updateCredits, checkCredits } = useCreditsContext();

  const [input, setInput] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [alert, setAlert] = useState(null);

  const styleOptions = [
    "Realistic",
    "Anime",
    "Cyberpunk",
    "Oil Painting",
    "3D Render",
    "Pixel Art",
    "Watercolor",
    "Sketch"
  ];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setAlert(null);
    setContent("");

    if (!checkCredits(10)) {
      setAlert("Insufficient credits. Please upgrade.");
      return;
    }

    const payload = {
      prompt: input,
      style: style
    };

    const parsed = ImagePayload.safeParse(payload);
    if (!parsed.success) {
      setAlert(parsed.error.errors[0].message);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      const { data, error } = await safeFetch(ENDPOINTS.image, {
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

      if (!data || !data.data || !data.data.content) {
        setAlert("System Error: No image received.");
        return;
      }

      setContent(data.data.content);
      if (data.data.credits !== undefined) {
        updateCredits(data.data.credits);
      } else {
        updateCredits();
      }
      toast.success("Image generated successfully!");

    } catch (error) {
      console.error("Generate Image Handler Error:", error);
      setAlert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const link = document.createElement("a");
    link.href = content;
    link.download = `quickai_${input.substring(0, 20).replace(/\s+/g, "_")}.png`;
    link.click();
    toast.success("Image downloaded!");
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
              <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Image className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Image Generator</h1>
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
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Prompt Description</label>
                <textarea
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  rows={4}
                  className="w-full p-4 text-base rounded-2xl border border-gray-200 dark:border-white/10 focus:border-emerald-500 transition-all outline-none resize-none bg-gray-50 dark:bg-[#1f1f23] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  placeholder="E.g., A majestic white tiger resting on a neon cyberpunk rooftop in Tokyo..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Art Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {styleOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStyle(opt)}
                      className={`p-2 rounded-xl text-xs font-medium border transition-all text-center ${
                        style === opt
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-gray-50 dark:bg-[#1f1f23] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={loading || !input.trim()}
                className="w-full mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Generated Image
            </h2>
            {content && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            )}
          </div>

          <div className="flex-1 rounded-2xl bg-gray-50 dark:bg-[#121215] border border-gray-200 dark:border-white/5 p-4 flex items-center justify-center overflow-hidden">
            {content ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <img
                  src={content}
                  alt="Generated AI"
                  className="max-h-[460px] w-auto object-contain rounded-2xl shadow-lg border border-gray-200 dark:border-white/10"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 py-16">
                <Image className="w-12 h-12 opacity-50 mb-3" />
                <p>Describe your vision and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GenerateImages;
