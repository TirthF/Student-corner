import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────────
export const registerProfile = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.patch('/auth/profile', data);

// ─── Resources ────────────────────────────────────────────────────────────
export const getResources = (params) => api.get('/resources', { params });
export const getResourceById = (id) => api.get(`/resources/${id}`);
export const downloadResource = (id) => api.get(`/resources/${id}/download`);
export const uploadResourceFile = (formData) =>
  api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyUploads = () => api.get('/resources/my-uploads');
export const getBookmarks = () => api.get('/resources/bookmarks');
export const toggleBookmark = (id) => api.post(`/resources/${id}/bookmark`);
export const getBookmarkStatus = (id) => api.get(`/resources/${id}/bookmark-status`);

// ─── Notices ──────────────────────────────────────────────────────────────
export const getNotices = (params) => api.get('/notices', { params });
export const createNotice = (data) => api.post('/notices', data);
export const deleteNotice = (id) => api.delete(`/notices/${id}`);

// ─── Admin / Moderation ───────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats');
export const getStudentDashboardStats = () => api.get('/admin/dashboard-stats');
export const getPendingResources = () => api.get('/admin/pending');
export const approveResource = (id) => api.patch(`/admin/resources/${id}/approve`);
export const rejectResource = (id, reason) => api.patch(`/admin/resources/${id}/reject`, { reason });
export const getUsers = (params) => api.get('/admin/users', { params });
export const createUser = (data) => api.post('/admin/users', data);
export const deactivateUser = (id) => api.patch(`/admin/users/${id}/deactivate`);
export const reactivateUser = (id) => api.patch(`/admin/users/${id}/reactivate`);

// ─── Notifications ────────────────────────────────────────────────────────
export const getNotifications = () => api.get('/admin/notifications');
export const markNotificationsRead = () => api.patch('/admin/notifications/mark-read');

export default api;
