import React, { createContext, useState, useCallback, useEffect } from 'react';
import API from '../api/axiosConfig'; 
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodeAndSetUser = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        return false; 
      }
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({
        username: decoded.username || decoded.sub,
        role: decoded.role,
        user_id: decoded.user_id
      });
      return true;
    } catch (e) {
      console.error("Błąd dekodowania tokena:", e);
      return false;
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('username');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  useEffect(() => {
    const restoreSession = () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (token) {
        const isValid = decodeAndSetUser(token);
        if (!isValid) handleLogout();
      }
      setLoading(false);
    };
    restoreSession();
  }, [decodeAndSetUser, handleLogout]);

  const handleLogin = useCallback(async (username, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);

      // ZMIANA: Ponieważ baseURL to root, musimy podać pełną ścieżkę /api/token/
      const response = await API.post('/api/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;
      const storage = rememberMe ? localStorage : sessionStorage;
      
      if (rememberMe) {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          localStorage.setItem('rememberMe', 'true');
      } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('rememberMe');
      }

      storage.setItem('access_token', access);
      storage.setItem('refresh_token', refresh);
      storage.setItem('username', username);

      const isSuccess = decodeAndSetUser(access);
      if (!isSuccess) throw new Error("Otrzymano nieprawidłowy token");

      return true;
    } catch (err) {
      console.error("Błąd logowania:", err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || 'Logowanie nie powiodło się.';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [decodeAndSetUser]);

  const value = {
    user,
    loading,
    error,
    handleLogin,
    login: handleLogin, 
    handleLogout,
    logout: handleLogout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export default AuthProvider;