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
// Response interceptor: on 401, clear ALL auth storage.
// Do NOT hard-redirect here — let UserProvider react to state change gracefully.
// This prevents form data loss and redirect loops.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('currentUser');
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
  createWithFile: async (formData: FormData) => {
    const response = await api.post('/attendance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  createWithFile: async (formData: FormData) => {
    const response = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  },
  updateWithFile: async (id: number, formData: FormData) => {
    const response = await api.put(`/reports/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
  download: async (id: number) => {
    const response = await api.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  },
};

// Work Hours API
export const workHoursApi = {
  get: async () => {
    const response = await api.get('/work-hours');
    return response.data;
  },
  getByUserId: async (userId: number) => {
    const response = await api.get(`/work-hours/${userId}`);
    return response.data;
  },
  update: async (startTime: string, endTime: string, userId?: number) => {
    const data: any = { start_time: startTime, end_time: endTime };
    if (userId) {
      data.user_id = userId;
    }
    const response = await api.put('/work-hours', data);
    return response.data;
  },
};

// Pending Registration API
export const pendingRegistrationApi = {
  register: async (data: any) => {
    const response = await api.post('/pending-register', data);
    return response.data;
  },
  getPendingRegistrations: async () => {
    const response = await api.get('/pending-registrations');
    return response.data;
  },
  approvePendingRegistration: async (id: number) => {
    const response = await api.post(`/pending-registrations/${id}/approve`);
    return response.data;
  },
  rejectPendingRegistration: async (id: number, reason?: string) => {
    const response = await api.post(`/pending-registrations/${id}/reject`, { reason });
    return response.data;
  },
  getPendingCount: async () => {
    const response = await api.get('/pending-registrations/count');
    return response.data;
  },
};

// SPK (AHP & ARAS) API
export const spkApi = {
  // AHP Questionnaire
  submitAhpQuestionnaire: async (data: { period: string; comparisons: Array<{ criteria_i: string; criteria_j: string; value: number }> }) => {
    const response = await api.post('/spk/ahp/questionnaire', data);
    return response.data;
  },
  getAhpQuestionnaire: async (period?: string) => {
    const response = await api.get('/spk/ahp/questionnaire', { params: { period } });
    return response.data;
  },
  getAhpResults: async (period?: string) => {
    const response = await api.get('/spk/ahp/results', { params: { period } });
    return response.data;
  },

  // ARAS Optimal Values
  setOptimalValues: async (data: { period: string; target_role: string; c1_optimal: number; c2_optimal: number; c3_optimal: number }) => {
    const response = await api.post('/spk/aras/optimal-values', data);
    return response.data;
  },
  getOptimalValues: async (period?: string, targetRole?: string) => {
    const response = await api.get('/spk/aras/optimal-values', { params: { period, target_role: targetRole } });
    return response.data;
  },

  // Work Quality Scores
  submitWorkQuality: async (data: { scored_user_id: number; score: number; period: string; notes?: string }) => {
    const response = await api.post('/spk/work-quality', data);
    return response.data;
  },
  getWorkQuality: async (period?: string) => {
    const response = await api.get('/spk/work-quality', { params: { period } });
    return response.data;
  },

  // ARAS Calculation
  calculateAras: async (data: { period: string; target_role: string }) => {
    const response = await api.post('/spk/aras/calculate', data);
    return response.data;
  },

  // Results
  getResults: async (period?: string, targetRole?: string) => {
    const response = await api.get('/spk/results', { params: { period, target_role: targetRole } });
    return response.data;
  },
  getEmployeeOfMonth: async (period?: string) => {
    const response = await api.get('/spk/employee-of-month', { params: { period } });
    return response.data;
  },
};

export default api;