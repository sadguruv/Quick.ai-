import React from "react";
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6 text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <p className="text-xl mb-6 text-slate-300">
                        {this.state.error?.message.includes("Clerk")
                            ? "Critical Auth Error: Invalid Clerk Publishable Key"
                            : "An unexpected error occurred."}
                    </p>

                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 max-w-lg w-full">
                        <h2 className="text-lg font-mono text-yellow-400 mb-2">How to Fix:</h2>
                        <ol className="list-decimal text-left pl-6 space-y-2 text-slate-300">
                            <li>Open <code>client/.env</code></li>
                            <li>Locate <code>VITE_CLERK_PUBLISHABLE_KEY</code></li>
                            <li>Replace the placeholder with your <strong>REAL</strong> key from the Clerk Dashboard.</li>
                            <li>Restart the application.</li>
                        </ol>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
