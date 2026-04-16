// utils/api.js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adm_token');
      localStorage.removeItem('adm_user');
      window.location.href = '/admin/';
    }
    return Promise.reject(err);
  }
);

export default api;
