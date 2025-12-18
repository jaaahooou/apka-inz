import axios from 'axios';

// --- ZMIANA: BaseURL to teraz sam adres serwera (bez /api) ---
// Dzięki temu zapytania typu '/court/cases/' będą poprawne.
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Sprawdzamy endpointy auth, żeby nie wpaść w pętlę
    const isAuthRequest = originalRequest.url && (originalRequest.url.includes('/token/') || originalRequest.url.includes('/auth/login'));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('Brak refresh tokenu');

        // Odświeżanie tokenu (ścieżka bez zmian, bo w urls.py jest api/token/refresh/)
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage;
        storage.setItem('access_token', access);

        API.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        return API(originalRequest);
      } catch (refreshError) {
        console.error('❌ Refresh token failed - logging out');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;