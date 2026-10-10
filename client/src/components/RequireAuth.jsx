import { useAuth } from "../auth/MockClerk";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useRole } from "../context/RoleContext"; // Ensure access to role

const RequireAuth = ({ children, allowedRoles }) => {
    const { isLoaded, userId } = useAuth();
    const { role } = useRole();
    const location = useLocation();

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ loop: Infinity, ease: "linear", duration: 1 }}
                    className="h-10 w-10 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full"
                />
            </div>
        );
    }

    if (!userId) {
        // Redirect them to the /sign-in page usually, but here we redirect to Login for now
        // Or if they were trying to access admin, maybe they should go there? 
        // For simplicity, default to AI User Login if unauthorized
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role Check
    if (allowedRoles && !allowedRoles.includes(role)) {
        // User is logged in but doesn't have the right role
        // Redirect to their dashboard or Home
        return <Navigate to="/ai" replace />;
    }

    return children;
};

RequireAuth.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default RequireAuth;
