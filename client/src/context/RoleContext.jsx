import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';

const RoleContext = createContext();

// Read user info from localStorage (set during login/signup)
const getStoredUser = () => {
    try {
        const stored = localStorage.getItem("user_info");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const buildUser = (info) => {
    const name = info?.fullName
        || (info?.firstName ? `${info.firstName} ${info.lastName || ''}`.trim() : null)
        || (info?.email ? info.email.split('@')[0] : null)
        || 'Guest';

    return {
        id: info?.id || info?.email || 'public-user',
        fullName: name,
        imageUrl: info?.imageUrl
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`,
        primaryEmailAddress: { emailAddress: info?.email || '' },
        publicMetadata: { role: 'service_provider' },
        role: info?.role || 'user',
        plan: info?.plan || 'free',
        credits: info?.credits ?? 1000,
        isAdmin: info?.role === 'admin'
    };
};

export const RoleProvider = ({ children }) => {
    const [storedInfo, setStoredInfo] = useState(getStoredUser);

    // Keep in sync if localStorage changes (e.g. after login)
    useEffect(() => {
        const onStorage = () => setStoredInfo(getStoredUser());
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const user = buildUser(storedInfo);
    
    // Map SQLite user role/plan to routing allowedRoles
    // admin or pro (monthly/yearly) -> 'service_provider'
    // normal user (free) -> 'ai_user'
    const role = (user.role === 'admin' || user.plan === 'monthly' || user.plan === 'yearly')
        ? 'service_provider'
        : 'ai_user';

    const isProvider = role === 'service_provider';
    const isUser = role === 'ai_user';
    const isAuthenticated = !!storedInfo;

    const loginAsUser = () => setStoredInfo(getStoredUser());
    const loginAsProvider = () => { };
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_info");
        setStoredInfo(null);
        window.location.href = "/";
    };

    return (
        <RoleContext.Provider value={{
            role,
            user,
            isProvider,
            isUser,
            isAuthenticated,
            loginAsProvider,
            loginAsUser,
            logout
        }}>
            {children}
        </RoleContext.Provider>
    );
};

RoleProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) throw new Error("useRole must be used within a RoleProvider");
    return context;
};
