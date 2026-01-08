import axios from 'axios';
import { getApiBaseUrl } from '../lib/apiConfig';

// Create axios instance with lazy baseURL evaluation
const api = axios.create({
  baseURL: '/api', // Default relative URL, will be overridden
  headers: {
    'Content-Type': 'application/json',
  },
});

// Override request interceptor to set baseURL dynamically
// This MUST run first to set the baseURL before other interceptors
const baseUrlInterceptor = api.interceptors.request.use((config) => {
  // Get fresh API base URL on each request
  const apiBaseUrl = getApiBaseUrl();
  
  // Debug logging (remove in production if needed)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.log('[API] Resolved baseURL:', apiBaseUrl);
  }
  
  // Always use absolute URL - CRITICAL for production
  if (apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')) {
    // Already absolute - use it directly
    config.baseURL = apiBaseUrl;
  } else if (typeof window !== 'undefined') {
    // Convert relative to absolute using current host
    const protocol = window.location.protocol;
    const host = window.location.host;
    const absoluteUrl = `${protocol}//${host}${apiBaseUrl.startsWith('/') ? '' : '/'}${apiBaseUrl}`;
    config.baseURL = absoluteUrl;
    
    if (window.location.hostname !== 'localhost') {
      console.log('[API] Converted to absolute URL:', absoluteUrl);
    }
  } else {
    // Server-side: use as-is (shouldn't happen but fallback)
    config.baseURL = apiBaseUrl;
  }
  
  // Ensure baseURL is never just '/api' or 'api' - must be full URL
  if (config.baseURL && !config.baseURL.startsWith('http://') && !config.baseURL.startsWith('https://')) {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const host = window.location.host;
      config.baseURL = `${protocol}//${host}${config.baseURL.startsWith('/') ? '' : '/'}${config.baseURL}`;
    }
  }
  
  return config;
}, undefined, { synchronous: true, runWhen: () => true });

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