import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: (typeof window !== 'undefined' && window.location.hostname === 'localhost') || process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api' 
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

export default api;
