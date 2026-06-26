import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('API REQUEST:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('API RESPONSE:', res.status, res.config.url);
    return res;
  },
  (err) => {
    console.error('API ERROR:', err.response?.status, err.config?.url, err.response?.data);
    if (err.response?.status === 401) {
      const isAuthRoute = err.config?.url?.includes('/auth/');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
