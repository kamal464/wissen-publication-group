import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  getJournals: () => api.get('/journals'),
  getJournal: (id: number) => api.get(`/journals/${id}`),
  createJournal: (data: any) => api.post('/admin/journals', data),
  updateJournal: (id: number, data: any) => api.put(`/admin/journals/${id}`, data),
  deleteJournal: (id: number) => api.delete(`/admin/journals/${id}`),
  
  // Articles
  getArticles: (params?: any) => api.get('/articles', { params }).then(response => ({
    data: (response.data as any)?.data || [],
    meta: (response.data as any)?.meta || {}
  })),
  getArticle: (id: number) => api.get(`/articles/${id}`),
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