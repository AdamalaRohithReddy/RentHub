import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('renthub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('renthub_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('renthub_token');
      if (savedToken) {
        try {
          const res = await api.getCurrentUser();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('renthub_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('renthub_token');
          localStorage.removeItem('renthub_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loginUser = (newToken, newUser) => {
    localStorage.setItem('renthub_token', newToken);
    localStorage.setItem('renthub_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logoutUser = () => {
    localStorage.removeItem('renthub_token');
    localStorage.removeItem('renthub_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
