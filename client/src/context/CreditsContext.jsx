import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../auth/MockClerk"; // Use generic auth hook
import { useRole } from "./RoleContext";
import { safeFetch } from "../lib/safeFetch";

const CreditsContext = createContext();

export const CreditsProvider = ({ children }) => {
  const { getToken, isLoaded, userId } = useAuth();
  const { role, user } = useRole(); // Get role and user from RoleContext

  // Default to 0, will fetch real value. 
  // Admin/Provider/Pro will be set to Infinity visually.
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  // FETCH CREDITS FROM SERVER
  const fetchCredits = async () => {
    if (!userId) return;

    // Optimistic check for roles that don't need API credits (Admin/Pro)
    const isProOrAdmin = role === 'service_provider' || 
                         role === 'admin' || 
                         user?.role === 'admin' || 
                         user?.plan === 'monthly' || 
                         user?.plan === 'yearly';

    if (isProOrAdmin) {
      setCredits(Infinity);
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const { data, error } = await safeFetch('/api/user/get-credits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (data && data.credits !== undefined) {
        setCredits(data.credits);
      } else if (error) {
        console.error("Credit Fetch Error:", error);
      }
    } catch (err) {
      console.error("Credit Context Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync on load or user/role change
  useEffect(() => {
    if (isLoaded && userId) {
      fetchCredits();
    }
  }, [isLoaded, userId, role]);

  // Method to manually update credits (e.g. after tool usage)
  const updateCredits = (newBalance) => {
    if (newBalance !== undefined && newBalance !== null) {
      setCredits(newBalance);
    } else {
      // Fallback: refetch if no specific balance provided
      fetchCredits();
    }
  };

  // Client-side guard (Optimistic)
  const checkCredits = (amount) => {
    if (credits === Infinity) return true;
    return credits >= amount;
  };

  return (
    <CreditsContext.Provider value={{
      credits,
      loading,
      role,
      checkCredits,
      updateCredits,
      fetchCredits
    }}>
      {children}
    </CreditsContext.Provider>
  );
};

CreditsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCreditsContext = () => useContext(CreditsContext);
