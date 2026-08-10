import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateFCMToken: (fcmToken) => api.put('/auth/fcm-token', { fcmToken })
};

// Farms
export const farmAPI = {
  create: (data) => api.post('/farms', data),
  getAll: (params) => api.get('/farms', { params }),
  getOne: (id) => api.get(`/farms/${id}`),
  update: (id, data) => api.put(`/farms/${id}`, data),
  delete: (id) => api.delete(`/farms/${id}`),
  getStats: () => api.get('/farms/stats')
};

// Livestock
export const livestockAPI = {
  add: (data) => api.post('/livestock', data),
  getAll: (params) => api.get('/livestock', { params }),
  update: (id, data) => api.put(`/livestock/${id}`, data),
  getStats: () => api.get('/livestock/stats')
};

// Vaccinations
export const vaccinationAPI = {
  create: (data) => api.post('/vaccinations', data),
  getAll: (params) => api.get('/vaccinations', { params }),
  update: (id, data) => api.put(`/vaccinations/${id}`, data),
  getUpcoming: () => api.get('/vaccinations/upcoming')
};

// Diseases
export const diseaseAPI = {
  report: (data) => api.post('/diseases', data),
  getAll: (params) => api.get('/diseases', { params }),
  update: (id, data) => api.put(`/diseases/${id}`, data)
};

// Biosecurity
export const biosecurityAPI = {
  assess: (data) => api.post('/biosecurity', data),
  getAll: (params) => api.get('/biosecurity', { params }),
  predict: (data) => api.post('/biosecurity/predict', data)
};

// GIS
export const gisAPI = {
  getAll: (params) => api.get('/gis', { params }),
  getNearby: (params) => api.get('/gis/nearby', { params }),
  getHeatmap: () => api.get('/gis/heatmap'),
  bufferAnalysis: (params) => api.get('/gis/buffer', { params }),
  create: (data) => api.post('/gis', data)
};

// Analytics
export const analyticsAPI = {
  disease: () => api.get('/analytics/disease'),
  vaccination: () => api.get('/analytics/vaccination'),
  biosecurity: () => api.get('/analytics/biosecurity'),
  dashboard: () => api.get('/analytics/dashboard'),
  district: () => api.get('/analytics/district')
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: () => api.put('/notifications/mark-read'),
  broadcast: (data) => api.post('/notifications/broadcast', data)
};

// Reports
export const reportAPI = {
  getVetReports: (params) => api.get('/reports/vet', { params }),
  createVetReport: (data) => api.post('/reports/vet', data),
  getAlerts: () => api.get('/reports/alerts'),
  createAlert: (data) => api.post('/reports/alerts', data)
};

// Users
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  getStats: () => api.get('/users/stats')
};

export default api;
