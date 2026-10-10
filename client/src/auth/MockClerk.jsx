import { useRole } from "../context/RoleContext";
import PropTypes from 'prop-types';

// Adapter to make existing components work with new Role System
export const useUser = () => {
    const { user, isAuthenticated } = useRole();
    return { user, isLoaded: true, isSignedIn: isAuthenticated };
};

export const useAuth = () => {
    const { user, isAuthenticated } = useRole();
    return {
        isLoaded: true,
        isSignedIn: isAuthenticated,
        userId: user?.id,
        getToken: async () => `quickai-token-${user?.id || 'anon'}`,
        sessionId: "mock-session-role",
    };
};

export const useClerk = () => {
    const { logout } = useRole();
    return {
        signOut: () => {
            // No-op / Redirect
            window.location.href = "/";
        },
        openUserProfile: () => { }, // No-op
    };
};

export const ClerkProvider = ({ children }) => <>{children}</>; // No-op now

export const SignedIn = ({ children }) => {
    const { isAuthenticated } = useRole();
    return isAuthenticated ? <>{children}</> : null;
};

export const SignedOut = ({ children }) => {
    // Should never render in Public Mode
    return null;
};

export const Protect = ({ children, fallback }) => {
    const { isAuthenticated } = useRole();
    return isAuthenticated ? <>{children}</> : (fallback || null);
};

export const UserButton = () => {
    // HIDE USER CONCEPT: Return null
    return null;
};

// Redirect legacy auth pages to Home
const RedirectHome = () => {
    window.location.href = "/";
    return null;
};

export const SignIn = RedirectHome;
export const SignUp = RedirectHome;

export const PricingTable = () => (
    <div className="p-8 bg-white rounded shadow text-center border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold text-gray-500">Pricing Managed by Admin Role</h3>
    </div>
);

ClerkProvider.propTypes = { children: PropTypes.node };
SignedIn.propTypes = { children: PropTypes.node };
SignedOut.propTypes = { children: PropTypes.node };
Protect.propTypes = { children: PropTypes.node, fallback: PropTypes.node };
