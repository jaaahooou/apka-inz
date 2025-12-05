import React, { createContext, useState, useCallback, useEffect } from 'react';
import API from '../api/axiosConfig';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const restoreSession = () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            handleLogout();
          } else {
            API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({
              username: decoded.username,
              role: decoded.role
            });
          }
        } catch (e) {
          console.error("Błąd dekodowania tokena przy starcie", e);
          handleLogout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);


  const handleLogin = useCallback(async (username, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.post('/api/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      const decoded = jwtDecode(access);
      console.log("Zdekodowany token:", decoded);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', access);
      storage.setItem('refresh_token', refresh);
      storage.setItem('username', username);
      
      if(rememberMe) localStorage.setItem('access_token', access);
      API.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      setUser({ 
        username: decoded.username,
        role: decoded.role
      });
      
      return true;
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Logowanie nie powiodło się';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
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

  const value = {
    user,
    loading,
    error,
    handleLogin,
    handleLogout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export default AuthProvider;