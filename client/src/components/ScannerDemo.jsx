import { motion } from "framer-motion";

const ScannerDemo = () => {
    return (
        <div className="flex flex-col items-center justify-center p-10 bg-black rounded-xl border border-gray-800 shadow-2xl w-full max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Scanner Active</h2>

            <div className="relative w-64 h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* Scanning Bar */}
                <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
                />

                {/* Content being scanned mockup */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gray-800 rounded-md flex items-center justify-center">
                        <span className="text-4xl">💳</span>
                    </div>
                </div>
            </div>

            <p className="text-gray-400 mt-6 text-center max-w-md">
                Payment Bypass Mode Active. <br />
                <span className="text-cyan-400 font-mono text-sm">System ID: DEV-SCANNER-01</span>
            </p>

            <div className="mt-8 flex gap-4">
                <button disabled className="px-6 py-2 bg-gray-700 text-gray-400 rounded cursor-not-allowed">
                    Processing...
                </button>
            </div>
        </div>
    );
};

export default ScannerDemo;
