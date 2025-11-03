import React, { createContext, useState, useCallback } from 'react';
import API from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = useCallback(async (username, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);

      // Logowanie
      const response = await API.post('/api/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // Wybiór storage
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', access);
      storage.setItem('refresh_token', refresh);
      storage.setItem('username', username);

      // Ustaw token w Axios
      API.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // Zapamiętaj czy był rememberMe
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      setUser({ username });
      return true;
    } catch (err) {
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
      {children}
    </AuthContext.Provider>
  );
};