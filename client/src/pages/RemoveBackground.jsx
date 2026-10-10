import { useState, useRef } from "react";
import { Eraser, Upload, Check, X, Download } from "lucide-react";
import { useAuth } from "../auth/MockClerk";
import toast from "react-hot-toast";
import { useCreditsContext } from "../context/CreditsContext";
import { motion, AnimatePresence } from "framer-motion";
import { safeFetch } from "../lib/safeFetch";
import { ENDPOINTS } from "../config/endpoints";

const RemoveBackground = () => {
  const { getToken } = useAuth();
  const { updateCredits, checkCredits } = useCreditsContext();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setAlert("Please upload a JPG, PNG, or WebP image");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setAlert("Image size must be less than 5MB");
      return;
    }

    setAlert(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
    setContent("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setAlert(null);
    setContent("");

    if (!file) {
      setAlert("Please select an image file first");
      return;
    }

    if (!checkCredits(10)) {
      setAlert("Insufficient credits. Please upgrade.");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", file);

      const { data, error } = await safeFetch(ENDPOINTS.removeBg, {
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

      if (!data || !data.data || !data.data.content) {
        setAlert("System Error: Background removal failed.");
        return;
      }

      setContent(data.data.content);
      if (data.data.credits !== undefined) {
        updateCredits(data.data.credits);
      } else {
        updateCredits();
      }
      toast.success("Background removed cleanly!");

    } catch (error) {
      console.error("Remove Bg Handler Error:", error);
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
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-600 dark:text-orange-400">
                <Eraser className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Background Eraser</h1>
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

            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isDragOver
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                  : 'border-gray-200 dark:border-white/10 hover:border-orange-300 bg-gray-50 dark:bg-[#1f1f23]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />

              {preview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain bg-black/5 dark:bg-black/40" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(""); }}
                    className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SVG, PNG, JPG (max. 5MB)</p>
                </>
              )}
            </div>

            <button
              onClick={onSubmitHandler}
              disabled={loading || !file}
              className="w-full mt-6 group flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Eraser className="w-5 h-5" />
                  Remove Background
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              Transparent Result
            </h2>
            {content && (
              <a
                href={content}
                download="transparent_subject.png"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </a>
            )}
          </div>

          <div className="flex-1 rounded-2xl bg-gray-100 dark:bg-[#121215] border border-gray-200 dark:border-white/5 flex items-center justify-center overflow-hidden relative p-4">
            <AnimatePresence mode="wait">
              {content ? (
                <motion.img
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={content}
                  alt="Processed"
                  className="max-h-[380px] w-auto object-contain z-10 relative"
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 dark:text-gray-500 p-8 z-10 relative"
                >
                  <Eraser className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Processed image with transparent background will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RemoveBackground;
