import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';  // your backend

const api = axios.create({
  baseURL: API_URL,
});

// Add token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;