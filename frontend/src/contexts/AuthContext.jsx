import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, clearToken, login as apiLogin, fetchMe, logout as apiLogout } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Small delay to ensure token is fully propagated to localStorage before fetchMe
      const timeoutId = setTimeout(() => {
        fetchMe()
          .then((u) => {
            setUser(u);
          })
          .catch((err) => {
            if (err?.status === 401) {
              clearToken();
              setTokenState(null);
              setUser(null);
            } else {
              // For other errors (network, etc.), don't log out - just set user to null
              setUser(null);
            }
          })
          .finally(() => setLoading(false));
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const u = await apiLogin(email, password);
    setTokenState(getToken());
    setUser(u);
    return u;
  };

  const logout = () => {
    apiLogout();
    setTokenState(null);
    setUser(null);
  };

  const forceReauth = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, forceReauth }}>
      {children}
    </AuthContext.Provider>
  );
};