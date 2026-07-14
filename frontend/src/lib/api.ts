import axios from 'axios';
import Cookies from 'js-cookie';



const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://swift-volt.onrender.com/api',
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
