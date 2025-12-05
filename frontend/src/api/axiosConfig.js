// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:8000', // URL Twojego backendu
//   timeout: 10000,
// });

// // Dodaj token do każdego requesty
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default API;

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
});

// ✅ Interceptor - dodaj token JWT
API.interceptors.request.use(
  (config) => {
    // Szukaj access_token (JWT), nie authToken
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ JWT token dodany do żądania');
    } else {
      console.warn('⚠️ Brak JWT tokenu');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor - obsługa błędu 401 i refresh tokenu
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('Brak refresh tokenu');
        }

        // Pobierz nowy access token
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        
        // Zapisz nowy token
        const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage;
        storage.setItem('access_token', access);

        // Ponów żądanie z nowym tokenem
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh nie powiódł się - wyloguj użytkownika
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
