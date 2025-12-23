import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    console.log('Token being sent:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/register', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },
  me: async () => {
    const response = await api.get('/me');
    return response.data;
  },
  availableUsers: async () => {
    const response = await api.get('/available-users');
    return response.data;
  },
  getAssignableUsers: async () => {
    const response = await api.get('/assignable-users');
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (filters?: any) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  updateSubtask: async (taskId: number, subtaskId: number, completed: boolean) => {
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, { completed });
    return response.data;
  },
  updateProgress: async (id: number, progress: number) => {
    const response = await api.put(`/tasks/${id}`, { progress });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },
};

// Team Management API (untuk PM)
export const teamApi = {
  getTeamMembers: async () => {
    const response = await api.get('/team');
    return response.data;
  },
  getAvailableEmployees: async () => {
    const response = await api.get('/team/available');
    return response.data;
  },
  addMember: async (employeeId: number) => {
    const response = await api.post('/team/members', { employee_id: employeeId });
    return response.data;
  },
  removeMember: async (employeeId: number) => {
    const response = await api.delete(`/team/members/${employeeId}`);
    return response.data;
  },
  updateTeam: async (employeeIds: number[]) => {
    const response = await api.put('/team', { employee_ids: employeeIds });
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (filters?: any) => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Attendance API
export const attendanceApi = {
  getAll: async (filters?: any) => {
    const response = await api.get('/attendance', { params: filters });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },
  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/attendance/stats');
    return response.data;
  },
};

// Reports API
export const reportsApi = {
  getAll: async (filters?: any) => {
    const response = await api.get('/reports', { params: filters });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
};

export default api;