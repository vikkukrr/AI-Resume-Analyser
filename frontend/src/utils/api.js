import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? '/api'
    : 'https://ai-resume-analyser-ernt.onrender.com/api');

console.log('🔗 API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('→ API REQUEST:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('← API RESPONSE:', res.status, res.config.url);
    return res;
  },
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url;
    const data = err.response?.data;
    console.error('✗ API ERROR:', status, url, data);

    if (status === 401) {
      const isAuthRoute = url?.includes('/auth/');
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
