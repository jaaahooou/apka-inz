import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000', // URL Twojego backendu
  timeout: 10000,
});

// Dodaj token do każdego requesty
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
