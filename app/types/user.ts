export type UserRole = 'ceo' | 'supervisor' | 'pm' | 'employee';

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

// ==========================================
// SPK (AHP & ARAS) Types
// ==========================================

export interface AhpComparison {
  criteria_i: string;
  criteria_j: string;
  value: number;
}

export interface AhpResult {
  id: number;
  period: string;
  weights: { c1: number; c2: number; c3: number };
  lambda_max: number;
  ci: number;
  ri: number;
  cr: number;
  is_consistent: boolean;
}

export interface ArasOptimalValues {
  id?: number;
  target_role: 'pm' | 'employee';
  c1_optimal: number;
  c2_optimal: number;
  c3_optimal: number;
  period: string;
}

export interface WorkQualityScore {
  id: number;
  scorer_id: number;
  scored_user_id: number;
  score: number;
  period: string;
  notes?: string;
  scorer?: User;
  scored_user?: User;
}

export interface SpkResult {
  id: number;
  user_id: number;
  period: string;
  target_role: 'pm' | 'employee';
  c1_value: number;
  c2_value: number;
  c3_value: number;
  si: number;
  ki: number;
  rank: number;
  user?: User;
}

export interface EmployeeOfMonth {
  top_pm?: SpkResult | null;
  top_employee?: SpkResult | null;
}