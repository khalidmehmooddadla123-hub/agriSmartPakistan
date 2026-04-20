import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000   // 90s — accommodates Render free tier cold start wake-up
});

// Helper: sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Add auth token + set cold-start flag
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 refresh + 502/503 cold start retry + 429
api.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status;
    const config = error.config || {};

    // 503/502 — Render free tier is waking up. Retry once after 15s.
    if ((status === 503 || status === 502 || error.code === 'ERR_NETWORK') && !config._coldRetry) {
      config._coldRetry = true;
      // Fire a custom event the UI can listen to for showing "waking up..." toast
      window.dispatchEvent(new CustomEvent('backend-waking'));
      await sleep(15000);
      try {
        return await api(config);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }

    // 401 — JWT expired, try refresh token
    if (status === 401 && !config._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        config._retry = true;
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('refreshToken', res.data.data.refreshToken);
          config.headers.Authorization = `Bearer ${res.data.data.token}`;
          return api(config);
        } catch {
          localStorage.clear();
          if (!window.location.pathname.match(/^\/(login|register|forgot|reset)/)) {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  requestOTP: (phone) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// Users
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

// Locations
export const locationAPI = {
  getCountries: () => api.get('/locations/countries'),
  getProvinces: (country) => api.get(`/locations/provinces/${country}`),
  getCities: (country, province) => api.get(`/locations/cities/${country}/${province}`),
  getAll: () => api.get('/locations'),
};

// Crops
export const cropAPI = {
  getAll: (params) => api.get('/crops', { params }),
  getById: (id) => api.get(`/crops/${id}`),
};

// Prices
export const priceAPI = {
  getAll: (params) => api.get('/prices', { params }),
  getLatest: (params) => api.get('/prices/latest', { params }),
  getHistory: (cropID, params) => api.get(`/prices/history/${cropID}`, { params }),
};

// Weather
export const weatherAPI = {
  getByLocation: (locationID) => api.get(`/weather/${locationID}`),
};

// News
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getById: (id) => api.get(`/news/${id}`),
  getCategories: () => api.get('/news/meta/categories'),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createCrop: (data) => api.post('/admin/crops', data),
  updateCrop: (id, data) => api.put(`/admin/crops/${id}`, data),
  deleteCrop: (id) => api.delete(`/admin/crops/${id}`),
  createPrice: (data) => api.post('/admin/prices', data),
  updatePrice: (id, data) => api.put(`/admin/prices/${id}`, data),
  deletePrice: (id) => api.delete(`/admin/prices/${id}`),
  createNews: (data) => api.post('/admin/news', data),
  getNews: (params) => api.get('/admin/news', { params }),
  updateNews: (id, data) => api.put(`/admin/news/${id}`, data),
  deleteNews: (id) => api.delete(`/admin/news/${id}`),
  createLocation: (data) => api.post('/admin/locations', data),
  broadcast: (data) => api.post('/admin/notifications/broadcast', data),
  getAnalytics: () => api.get('/admin/analytics'),
};

// Recommendations
export const recommendationAPI = {
  get: (params) => api.get('/recommendations', { params }),
};

// Disease Outbreaks
export const outbreakAPI = {
  getAll: () => api.get('/outbreaks'),
  scan: () => api.post('/outbreaks/scan'),
};

// Farmer Tools (calculators)
export const toolsAPI = {
  irrigation: (data) => api.post('/tools/irrigation', data),
  fertilizer: (data) => api.post('/tools/fertilizer', data),
  yield: (data) => api.post('/tools/yield', data),
  rotation: (data) => api.post('/tools/rotation', data),
  zakat: (data) => api.post('/tools/zakat', data),
};

// Expense Tracker
export const expenseAPI = {
  list: (params) => api.get('/expenses', { params }),
  summary: (params) => api.get('/expenses/summary', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Marketplace
export const marketplaceAPI = {
  list: (params) => api.get('/marketplace', { params }),
  mine: () => api.get('/marketplace/mine'),
  get: (id) => api.get(`/marketplace/${id}`),
  create: (data) => api.post('/marketplace', data),
  update: (id, data) => api.put(`/marketplace/${id}`, data),
  inquire: (id) => api.post(`/marketplace/${id}/inquire`),
  delete: (id) => api.delete(`/marketplace/${id}`),
};

// Forum
export const forumAPI = {
  list: (params) => api.get('/forum', { params }),
  get: (id) => api.get(`/forum/${id}`),
  create: (data) => api.post('/forum', data),
  comment: (id, data) => api.post(`/forum/${id}/comments`, data),
  upvote: (id) => api.post(`/forum/${id}/upvote`),
  resolve: (id) => api.put(`/forum/${id}/resolve`),
  delete: (id) => api.delete(`/forum/${id}`),
};

// Export
export const exportAPI = {
  pricesCSV: (params) => api.get('/export/prices/csv', { params, responseType: 'blob' }),
  pricesPDF: (params) => api.get('/export/prices/pdf', { params, responseType: 'blob' }),
};

export default api;
