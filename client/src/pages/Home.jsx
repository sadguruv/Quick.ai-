import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useUser } from "../auth/MockClerk";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Image as ImageIcon,
  Type,
  Eraser,

  FileText,
  Rocket
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const tools = [
    {
      icon: Type,
      title: "Write Article",
      desc: "Generate SEO-optimized articles in seconds.",
      path: "/ai/write-article",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: ImageIcon,
      title: "Image Generator",
      desc: "Turn your words into stunning visuals.",
      path: "/ai/generate-images",
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      icon: Eraser,
      title: "Remove Background",
      desc: "Instantly remove backgrounds from images.",
      path: "/ai/remove-background",
      color: "text-orange-500",
      bg: "bg-orange-50"
    },

    {
      icon: FileText,
      title: "Resume Reviewer",
      desc: "Get expert feedback on your resume.",
      path: "/ai/review-resume",
      color: "text-pink-500",
      bg: "bg-pink-50"
    },
    {
      icon: Sparkles,
      title: "Blog Titles",
      desc: "Catchy titles for your next viral post.",
      path: "/ai/blog-titles",
      color: "text-yellow-500",
      bg: "bg-yellow-50"
    }
  ];

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
    <div className="snap-scroll-container bg-[#F4F7FB]">
      {/* SECTION 1: Navbar + Hero */}
      <section className="snap-section-start flex flex-col">
        {/* Navbar - Absolute for Hero */}
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto z-20 w-full">
          <img src={assets.logo} alt="QuickAI" className="w-32 hover:opacity-80 transition-opacity cursor-pointer" />
          <div className="flex gap-4">
            <>
              <button
                onClick={() => navigate("/login")}
                className="bg-transparent border border-blue-600 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-50 transition-all duration-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-200 ease-in-out"
              >
                Sign Up
              </button>
            </>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-4 text-center z-10 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-600">The Ultimate AI Productivity Suite</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight leading-tight max-w-4xl"
          >
            Unleash your potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">QuickAI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl text-gray-600 max-w-2xl px-4"
          >
            Access a suite of powerful AI tools to write, design, and create faster than ever before.
          </motion.p>

          {/* Premium Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 p-1 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 max-w-3xl w-full mx-4 shadow-xl"
          >
            <div className="bg-white rounded-xl py-6 px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Upgrade to Premium
                </h3>
                <p className="text-gray-500 text-sm mt-1">Get unlimited credits and exclusive tools for just <span className="font-bold text-gray-900">₹599/year</span></p>
              </div>
              <button
                onClick={() => navigate("/signup")}
                className="whitespace-nowrap bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-transform hover:scale-105 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                Get Pro Access
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Tools Grid */}
      <section className="snap-section flex items-center justify-center py-12">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Tools</h2>
            <p className="text-gray-500 mt-2">Everything you need to create amazing content.</p>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                variants={item}
                onClick={() => navigate(tool.path)}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {tool.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: Pricing */}
      <section className="snap-section flex items-center justify-center py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple & Transparent Pricing</h2>
            <p className="text-gray-500 mb-12 max-w-2xl mx-auto">Choose the plan that fits your needs. No hidden fees, cancel anytime.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl flex flex-col items-start text-left relative overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-gray-900">Pro Monthly</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$199</span>
                <span className="text-gray-500">/ month</span>
              </div>
              <p className="mt-4 text-gray-500">Perfect for individuals just starting out.</p>

              <ul className="mt-8 space-y-4 flex-1">
                {['Unlimited Projects', 'Standard Support', 'Access to all Tools', '5GB Storage'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Zap className="w-3 h-3" />
                    </div>
                    <span className="text-gray-600">{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => console.log('Get Monthly Plan clicked')}
                className="mt-8 w-full bg-white text-primary border-2 border-primary py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Get Monthly Plan
              </button>
            </motion.div>

            {/* Yearly Plan */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-[#0F172A] p-8 rounded-3xl border border-gray-800 shadow-2xl flex flex-col items-start text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                Best Value
              </div>
              <h3 className="text-2xl font-bold text-white">Pro Yearly</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">$1999</span>
                <span className="text-gray-400">/ year</span>
              </div>
              <p className="mt-4 text-gray-400">Save 20% and get priority features.</p>

              <ul className="mt-8 space-y-4 flex-1">
                {['Everything in Monthly', 'Priority Support', 'Early Access Features', '100GB Storage'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Zap className="w-3 h-3" />
                    </div>
                    <span className="text-gray-300">{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => console.log('Get Yearly Plan clicked')}
                className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
              >
                Get Yearly Plan
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Footer */}
      <section className="snap-section-start bg-white border-t border-gray-100 py-12 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>© 2026 QuickAI Inc. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
