import axios from 'axios';
import Cookies from 'js-cookie';

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.')
);

const api = axios.create({
  baseURL: isLocal || process.env.NODE_ENV === 'development'
    ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001/api`
    : 'https://swift-volt.onrender.com/api',
});

api.interceptors.request.use((config) => {
  console.log('[Axios Request]', config.baseURL, config.url);
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
