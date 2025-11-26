import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3001/api';

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
  getAll: () => api.get('/journals'),
  getById: (id: number) => api.get(`/journals/${id}`),
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