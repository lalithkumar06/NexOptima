import axios from 'axios';

// Use VITE_API_URL from .env, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

});

// ✅ Interceptor to add JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Adjust if using sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile')
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getByRole: (role) => api.get(`/users/role/${role}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`)
};

// Attendance API
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/checkin'),
  checkOut: () => api.post('/attendance/checkout'),
  getMyAttendance: (month, year) => api.get(`/attendance/my-attendance?month=${month}&year=${year}`),
  getTeamAttendance: (date) => api.get(`/attendance/team?date=${date}`)
};

// Leave API
export const leaveAPI = {
  apply: (leaveData) => api.post('/leaves', leaveData),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getPendingLeaves: () => api.get('/leaves/pending'),
  updateStatus: (id, status, rejectionReason) =>
    api.put(`/leaves/${id}/status`, { status, rejectionReason })
};

// Tasks API
export const tasksAPI = {
  create: (taskData) => api.post('/tasks', taskData),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  getAll: () => api.get('/tasks'),
  updateStatus: (id, status, actualHours) =>
    api.put(`/tasks/${id}/status`, { status, actualHours }),
  inspect: (id, inspectionStatus, inspectionNotes) =>
    api.put(`/tasks/${id}/inspect`, { inspectionStatus, inspectionNotes })
};

// Work Logs API
export const workLogsAPI = {
  create: (workLogData) => api.post('/worklogs', workLogData),
  getMyLogs: (month, year) => api.get(`/worklogs/my-logs?month=${month}&year=${year}`),
  getTeamLogs: (date, userId) => api.get(`/worklogs/team?date=${date}&userId=${userId}`)
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: () => api.get('/dashboard/analytics')
};

export default api;
