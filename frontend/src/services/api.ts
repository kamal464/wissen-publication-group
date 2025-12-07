import axios from 'axios';
import { getApiBaseUrl } from '../lib/apiConfig';

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export const journalService = {
  getAll: () => {
    // Add cache-busting to ensure fresh data
    const cacheBuster = Date.now();
    return api.get(`/journals?_t=${cacheBuster}`);
  },
  getById: (id: number) => {
    const cacheBuster = Date.now();
    return api.get(`/journals/${id}?_t=${cacheBuster}`);
  },
  getByShortcode: (shortcode: string) => {
    const cacheBuster = Date.now();
    return api.get(`/journals/shortcode/${shortcode}?_t=${cacheBuster}`);
  },
  create: (data: any) => api.post('/journals', data),
  update: (id: number, data: any) => api.put(`/journals/${id}`, data),
  delete: (id: number) => api.delete(`/journals/${id}`),
};

export const articleService = {
  getAll: (params?: any) => api.get('/articles', { params }),
  getById: (id: number) => api.get(`/articles/${id}`),
  getRelated: (id: number, limit: number = 5) => api.get(`/articles/${id}/related`, { params: { limit } }),
  create: (data: any) => api.post('/articles', data),
  update: (id: number, data: any) => api.patch(`/articles/${id}`, data),
  delete: (id: number) => api.delete(`/articles/${id}`),
  submitManuscript: (formData: FormData) =>
    api.post('/articles/manuscripts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const authService = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: { email: string; password: string; name: string }) => 
    api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default api;