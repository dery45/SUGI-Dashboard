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
      fetchMe()
        .then((u) => {
          setUser(u);
        })
        .catch((err) => {
          if (err?.status) {
            clearToken();
            setTokenState(null);
            setUser(null);
          } else {
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};