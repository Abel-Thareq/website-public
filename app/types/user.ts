export type UserRole = 'supervisor' | 'pm' | 'employee';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  initials: string;
  department: string;
  employeeCount?: number;
  color: string;
  email: string;
  phone?: string;
  joinDate: string;
  position?: string;
  avatar?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export type TaskSubtask = {
  id: number;
  description: string;
  completed: boolean;
};


// Interface untuk data yang digunakan di berbagai halaman
export interface Task {
  assigner?: string; // who assigned this task
  subtasks?: TaskSubtask[];
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'review';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  department: string;
  deadline: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours?: number;
  tags?: string[];
  comments?: TaskComment[];
}

export interface TaskComment {
  id: number;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
  isInternal?: boolean;
}

export interface AttendanceRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'on-time' | 'late' | 'absent' | 'leave';
  lateMinutes?: number;
  workHours: number;
  notes?: string;
  eodReport?: string;
  hasDocumentation?: boolean;
  documentationFile?: string;
}

export interface Report {
  id: number;
  title: string;
  type: 'performance' | 'attendance' | 'productivity' | 'department';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  generatedDate: string;
  department?: string;
  employeeName?: string;
  downloadUrl?: string;
  summary?: string;
}