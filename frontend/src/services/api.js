import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Endpoints we DON'T auto-toast on (caller handles its own errors / silent expected fails)
const SILENT_ENDPOINTS = [
  '/auth/me',
  '/auth/refresh-token',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password'
];

const isSilent = (url = '') => SILENT_ENDPOINTS.some(s => url.includes(s));

// De-dupe noisy repeated errors (same message within 3s)
const recentErrors = new Map();
function showErrorToast(message) {
  const now = Date.now();
  const last = recentErrors.get(message);
  if (last && now - last < 3000) return;
  recentErrors.set(message, now);
  toast.error(message, { duration: 4500, icon: '⚠️' });
  // GC old entries
  if (recentErrors.size > 30) {
    for (const [k, t] of recentErrors) {
      if (now - t > 10000) recentErrors.delete(k);
    }
  }
}

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

    // Surface errors as toasts so silent .catch handlers across the app
    // still give the user a visible reason something failed. Skip for endpoints
    // that handle their own errors (auth flows, the /me probe).
    const url = config.url || '';
    if (!isSilent(url) && !config._silentToast) {
      let message;
      if (status === 429) {
        message = error.response?.data?.message || 'Too many requests. Please wait a moment.';
      } else if (status === 403) {
        message = error.response?.data?.message || 'You do not have permission to do this.';
      } else if (status === 404) {
        message = error.response?.data?.message || 'Resource not found.';
      } else if (status === 400 || status === 422) {
        message = error.response?.data?.message || 'Invalid request — check your input.';
      } else if (status >= 500) {
        message = error.response?.data?.message || 'Server error. Please try again.';
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. The server may be slow — try again.';
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        message = 'Network error. Check your connection.';
      } else {
        message = error.response?.data?.message || error.message || 'Something went wrong.';
      }
      showErrorToast(message);
    }

    return Promise.reject(error);
  }
);

// Auth (email-only)
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
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
  // Crops
  getCrops: (params) => api.get('/admin/crops', { params }),
  createCrop: (data) => api.post('/admin/crops', data),
  updateCrop: (id, data) => api.put(`/admin/crops/${id}`, data),
  deleteCrop: (id) => api.delete(`/admin/crops/${id}`),
  // Prices
  getPrices: (params) => api.get('/admin/prices', { params }),
  createPrice: (data) => api.post('/admin/prices', data),
  updatePrice: (id, data) => api.put(`/admin/prices/${id}`, data),
  deletePrice: (id) => api.delete(`/admin/prices/${id}`),
  // Locations
  getLocations: (params) => api.get('/admin/locations', { params }),
  updateLocation: (id, data) => api.put(`/admin/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/admin/locations/${id}`),
  createNews: (data) => api.post('/admin/news', data),
  getNews: (params) => api.get('/admin/news', { params }),
  updateNews: (id, data) => api.put(`/admin/news/${id}`, data),
  deleteNews: (id) => api.delete(`/admin/news/${id}`),
  createLocation: (data) => api.post('/admin/locations', data),
  broadcast: (data) => api.post('/admin/notifications/broadcast', data),
  getAnalytics: () => api.get('/admin/analytics'),
  // Subsidies
  getSubsidies: () => api.get('/admin/subsidies'),
  createSubsidy: (data) => api.post('/admin/subsidies', data),
  updateSubsidy: (id, data) => api.put(`/admin/subsidies/${id}`, data),
  deleteSubsidy: (id) => api.delete(`/admin/subsidies/${id}`),
  // Loan Providers
  getLoanProviders: () => api.get('/admin/loan-providers'),
  createLoanProvider: (data) => api.post('/admin/loan-providers', data),
  updateLoanProvider: (id, data) => api.put(`/admin/loan-providers/${id}`, data),
  deleteLoanProvider: (id) => api.delete(`/admin/loan-providers/${id}`),
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

// Calendar
export const calendarAPI = {
  list: () => api.get('/calendar'),
};

// Farms
export const farmAPI = {
  list: () => api.get('/farms'),
  get: (id) => api.get(`/farms/${id}`),
  create: (data) => api.post('/farms', data),
  update: (id, data) => api.put(`/farms/${id}`, data),
  delete: (id) => api.delete(`/farms/${id}`),
  summary: (id) => api.get(`/farms/${id}/summary`),
  addCrop: (id, data) => api.post(`/farms/${id}/crops`, data),
  updateCrop: (id, cropId, data) => api.put(`/farms/${id}/crops/${cropId}`, data),
  removeCrop: (id, cropId) => api.delete(`/farms/${id}/crops/${cropId}`),
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

// Subsidies & Schemes
export const subsidyAPI = {
  list: (params) => api.get('/subsidies', { params }),
  get: (id) => api.get(`/subsidies/${id}`),
};

// Loan Providers
export const loanAPI = {
  list: () => api.get('/loan-providers'),
  get: (id) => api.get(`/loan-providers/${id}`),
};

// Export
export const exportAPI = {
  pricesCSV: (params) => api.get('/export/prices/csv', { params, responseType: 'blob' }),
  pricesPDF: (params) => api.get('/export/prices/pdf', { params, responseType: 'blob' }),
};

export default api;
