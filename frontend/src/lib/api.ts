import axios from 'axios';
import { getApiBaseUrl } from './apiConfig';

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
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (check both admin types)
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminAuth');
      const journalAdminToken = localStorage.getItem('journalAdminAuth');
      const token = adminToken || journalAdminToken;
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        
        // Clear appropriate auth based on current route
        if (pathname.startsWith('/journal-admin')) {
          localStorage.removeItem('journalAdminAuth');
          localStorage.removeItem('journalAdminUser');
          window.location.href = '/journal-admin/login';
        } else if (pathname.startsWith('/admin')) {
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Journals
  getJournals: () => {
    // Add cache-busting to ensure fresh data
    const cacheBuster = Date.now();
    return api.get(`/journals?_t=${cacheBuster}`);
  },
  getJournal: (id: number | string) => {
    // Add cache-busting to ensure fresh data
    const cacheBuster = Date.now();
    return api.get(`/journals/${id}?_t=${cacheBuster}`);
  },
  getJournalByShortcode: (shortcode: string) => {
    // Add cache-busting to ensure fresh data
    const cacheBuster = Date.now();
    return api.get(`/journals/shortcode/${shortcode}?_t=${cacheBuster}`);
  },
  createJournal: (data: any) => api.post('/admin/journals', data),
  updateJournal: (id: number, data: any) => api.put(`/admin/journals/${id}`, data),
  deleteJournal: (id: number) => api.delete(`/admin/journals/${id}`),
  
  // Articles
  getArticles: (params?: any) => api.get('/articles', { params }).then(response => ({
    data: (response.data as any)?.data || [],
    meta: (response.data as any)?.meta || {}
  })),
  getArticle: (id: number) => api.get(`/articles/${id}`),
  createArticle: (data: any) => api.post('/articles', data),
  updateArticle: (id: number, data: any) => api.patch(`/articles/${id}`, data),
  deleteArticle: (id: number) => api.delete(`/articles/${id}`),
  updateArticleStatus: (id: number, status: string, comments?: string) => 
    api.put(`/admin/articles/${id}/status`, { status, comments }),
  
  // Review Articles
  getReviewArticles: () => api.get('/admin/articles/review'),
  submitReview: (articleId: number, decision: string, comments: string) =>
    api.post(`/admin/articles/${articleId}/review`, { decision, comments }),
  
  // Pending Submissions
  getPendingArticles: () => api.get('/admin/articles/pending'),
  assignReviewer: (articleId: number, reviewerId: number) =>
    api.post(`/admin/articles/${articleId}/assign`, { reviewerId }),
  
  // Analytics
  getJournalAnalytics: () => api.get('/admin/analytics/journals'),
  getArticleAnalytics: () => api.get('/admin/analytics/articles'),
  getSearchAnalytics: () => api.get('/admin/analytics/search'),

  // Authentication
  login: (username: string, password: string) => 
    api.post('/admin/login', { username, password }),

  // Users
  getUsers: (search?: string) => api.get('/admin/users', { params: { search } }),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id: number) => api.put(`/admin/users/${id}/toggle`),

  // Submissions
  getSubmissions: (search?: string) => api.get('/admin/submissions', { params: { search } }),
  getSubmission: (id: number) => api.get(`/admin/submissions/${id}`),

  // Journal Shortcodes
  getJournalShortcodes: () => api.get('/admin/journal-shortcodes'),
  createJournalShortcode: (journalName: string, shortcode: string) => 
    api.post('/admin/journal-shortcodes', { journalName, shortcode }),
  deleteJournalShortcode: (id: number) => api.delete(`/admin/journal-shortcodes/${id}`),

  // Notifications
  getNotifications: (unreadOnly?: boolean) => api.get('/admin/notifications', { params: { unreadOnly } }),
  markNotificationAsRead: (id: number) => api.put(`/admin/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.put('/admin/notifications/read-all'),

  // Global Search
  globalSearch: (query: string) => api.get('/admin/search', { params: { query } }),

  // Journal Image Upload
  uploadJournalImage: (journalId: number, field: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', field);
    return api.post(`/admin/journals/${journalId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Board Members
  getBoardMembers: (journalId?: number) => 
    api.get('/admin/board-members', { params: journalId ? { journalId } : {} }),
  getBoardMember: (id: number) => api.get(`/admin/board-members/${id}`),
  createBoardMember: (data: any) => api.post('/admin/board-members', data),
  updateBoardMember: (id: number, data: any) => api.put(`/admin/board-members/${id}`, data),
  deleteBoardMember: (id: number) => api.delete(`/admin/board-members/${id}`),
  uploadBoardMemberPhoto: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/board-members/${id}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Latest News
  getNews: (journalId?: number) => 
    api.get('/news', { params: journalId ? { journalId } : {} }),
  getLatestNews: (limit?: number) => 
    api.get('/news/latest', { params: limit ? { limit } : {} }),
  getNewsItem: (id: number) => api.get(`/news/${id}`),
  createNews: (data: any) => api.post('/news', data),
  updateNews: (id: number, data: any) => api.put(`/news/${id}`, data),
  deleteNews: (id: number) => api.delete(`/news/${id}`),
};

// Journal Management API
export const journalAPI = {
  // Meta Information
  getJournalMeta: (journalId: number) => api.get(`/admin/journals/${journalId}/meta`),
  updateJournalMeta: (journalId: number, data: any) => api.put(`/admin/journals/${journalId}/meta`, data),
  
  // Content Management
  getJournalContent: (journalId: number, contentType: string) => 
    api.get(`/admin/journals/${journalId}/content/${contentType}`),
  updateJournalContent: (journalId: number, contentType: string, data: any) => 
    api.put(`/admin/journals/${journalId}/content/${contentType}`, data),
  
  // Home Page
  getJournalHomePage: (journalId: number) => api.get(`/admin/journals/${journalId}/home`),
  updateJournalHomePage: (journalId: number, data: any) => api.put(`/admin/journals/${journalId}/home`, data),
  
  // Aims & Scope
  getAimsScope: (journalId: number) => api.get(`/admin/journals/${journalId}/aims-scope`),
  updateAimsScope: (journalId: number, data: any) => api.put(`/admin/journals/${journalId}/aims-scope`, data),
  
  // Guidelines
  getGuidelines: (journalId: number) => api.get(`/admin/journals/${journalId}/guidelines`),
  updateGuidelines: (journalId: number, data: any) => api.put(`/admin/journals/${journalId}/guidelines`, data),
  
  // Editorial Board
  getEditorialBoard: (journalId: number) => api.get(`/admin/journals/${journalId}/editorial-board`),
  updateEditorialBoard: (journalId: number, data: any) => api.put(`/admin/journals/${journalId}/editorial-board`, data),
  
  // Articles in Press
  getArticlesInPress: (journalId: number) => api.get(`/admin/journals/${journalId}/articles-press`),
  updateArticlesInPress: (journalId: number, data: any) => api.put(`/admin/journals/${journalId}/articles-press`, data),
  
  // Current Issue
  getCurrentIssue: (journalId: number) => api.get(`/admin/journals/${journalId}/current-issue`),
  updateCurrentIssue: (journalId: number, data: any) => api.put(`/admin/journals/${journalId}/current-issue`, data),
  
  // Archive
  getArchive: (journalId: number) => api.get(`/admin/journals/${journalId}/archive`),
  updateArchive: (journalId: number, data: any) => api.put(`/admin/journals/${journalId}/archive`, data),
};

export default api;