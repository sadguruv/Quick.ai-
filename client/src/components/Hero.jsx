import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useRole } from "../context/RoleContext";
import { motion } from "framer-motion";
import {
  Type,
  Image as ImageIcon,
  Eraser,
  Scissors,
  FileText,
  Sparkles,
  Zap,
  CheckCircle
} from "lucide-react";

// Tools Data
const tools = [
  {
    id: 1,
    name: "Write Article",
    desc: "Generate high-quality articles on any topic in seconds.",
    icon: Type,
    color: "bg-blue-100 text-blue-600",
    role: "All"
  },
  {
    id: 2,
    name: "Blog Titles",
    desc: "Create catchy and SEO-friendly titles for your blog posts.",
    icon: HashIcon, // Helper component below
    color: "bg-purple-100 text-purple-600",
    role: "All"
  },
  {
    id: 3,
    name: "Generate Images",
    desc: "Turn your text prompts into stunning visual art.",
    icon: ImageIcon,
    color: "bg-pink-100 text-pink-600",
    role: "All"
  },
  {
    id: 4,
    name: "Remove Background",
    desc: "Instantly remove backgrounds from any image.",
    icon: Eraser,
    color: "bg-orange-100 text-orange-600",
    role: "Service Provider"
  },
  {
    id: 5,
    name: "Remove Object",
    desc: "Clean up your photos by removing unwanted objects.",
    icon: Scissors,
    color: "bg-red-100 text-red-600",
    role: "Service Provider"
  },
  {
    id: 6,
    name: "Review Resume",
    desc: "Get AI-powered feedback to improve your resume.",
    icon: FileText,
    color: "bg-green-100 text-green-600",
    role: "Service Provider"
  },
];

// Helper Icon for Hash
function HashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

const Hero = () => {
  const navigate = useNavigate();
  const { loginAsProvider, loginAsUser } = useRole();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden font-sans">

      {/* Hero Section */}
      <div className="relative pt-20 pb-32 lg:pt-32 bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 border border-blue-100">
              ✨ Next-Gen AI Content Creation
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Unleash your creativity <br /> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">QuickAI</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Access a suite of powerful AI tools to write, design, and edit content in seconds.
              Join thousands of creators today.
            </p>
          </motion.div>

          {/* Role Selection Buttons (Required for Demo) */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => navigate("/admin-login")}
              className="group relative px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-800 transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-full">
                  <Zap className="w-5 h-5 text-yellow-300" />
                </div>
                <span>Service Provider</span>
              </div>
              <span className="absolute -top-3 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">ADMIN</span>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg border border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <span>🚀</span> AI User (Demo)
            </button>
          </motion.div>
        </div>
      </div>

      {/* Tools Showcase */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Tools for Everyone</h2>
            <p className="text-gray-600">Explore our comprehensive range of AI-powered features.</p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {tools.map((tool) => (
              <motion.div
                key={tool.id}
                variants={itemVariants}
                className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{tool.name}</h3>
                <p className="text-gray-600 mb-4 h-12 leading-relaxed">{tool.desc}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 rounded-md bg-gray-200 text-gray-700 font-medium text-xs`}>
                    {tool.role === "Service Provider" ? "🔒 Provider Only" : "✅ Available to All"}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Pricing / Plan Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">

            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm relative">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI User</h3>
              <p className="text-gray-500 mb-6">Perfect for trying out the power of AI.</p>
              <div className="text-4xl font-bold text-gray-900 mb-6">Free<span className="text-lg text-gray-500 font-normal">/forever</span></div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  1,000 Free Credits
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Access to basic tools
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Community access
                </li>
              </ul>
              <button onClick={() => navigate("/login")} className="w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors">
                Get Started
              </button>
            </div>

            {/* Premium Plan */}
            <div className="p-1 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl transform md:scale-105 relative z-10">
              <div className="bg-white p-8 rounded-[22px] h-full">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Provider</h3>
                <p className="text-gray-500 mb-6">Unlimited power for professionals.</p>
                <div className="text-4xl font-bold text-gray-900 mb-6">₹599<span className="text-lg text-gray-500 font-normal">/year</span></div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="p-1 rounded-full bg-green-100"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                    <span className="font-bold text-gray-900">Unlimited Credits</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="p-1 rounded-full bg-green-100"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                    <span>Access to ALL Premium Tools</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="p-1 rounded-full bg-green-100"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="p-1 rounded-full bg-green-100"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                    <span>Early access to new features</span>
                  </li>
                </ul>
                <button onClick={() => navigate("/admin-login")} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-blue-500/30 transition-shadow">
                  Upgrade to Premium
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Hero;
