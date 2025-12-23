"use client";

import { useState, useEffect, useMemo } from "react";
import NavigationBar from "../components/navigationBar";
import Link from "next/link";
import { Task, TaskSubtask } from "../types/user";
import { useTheme } from "../providers/temaProvider";
import { useUser } from "../providers/userProvider";
import { useRouter } from "next/navigation";
import { tasksApi, teamApi, authApi } from '../../lib/api';

// Icon Components
const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SupervisorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TeamIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-15" />
  </svg>
);

export default function TasksPage() {
  const { theme } = useTheme();
  const { currentUser, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    assignee: "",
    deadline: "",
    estimatedHours: 8,
    subtasks: [] as TaskSubtask[]
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Tambahkan state untuk delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // State untuk team management
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);

  // Redirect ke home jika user belum login (tapi tunggu loading selesai dulu!)
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, userLoading, router]);

  // Load tasks from API
  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser, selectedFilter, selectedPriority, selectedDepartment, searchTerm]);

  // Load team members untuk PM dan assignable users untuk supervisor
  useEffect(() => {
    if (currentUser?.role === 'pm') {
      loadTeamMembers();
    } else if (currentUser?.role === 'supervisor') {
      loadAssignableUsers();
    }
  }, [currentUser]);

  const loadTasks = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedFilter !== 'all') filters.status = selectedFilter;
      if (selectedPriority !== 'all') filters.priority = selectedPriority;
      if (selectedDepartment !== 'all') filters.department = selectedDepartment;
      if (searchTerm) filters.search = searchTerm;

      // Tambahkan filter berdasarkan role
      if (currentUser.role === 'employee') {
        filters.assignee_id = currentUser.id;
      } else if (currentUser.role === 'pm') {
        filters.department = currentUser.department;
        filters.pm_id = currentUser.id;
      }
      // Supervisor tidak butuh filter tambahan

      const data = await tasksApi.getAll(filters);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignableUsers = async () => {
    if (!currentUser) return;
    
    try {
      const users = await authApi.getAssignableUsers();
      setAssignableUsers(users);
    } catch (error) {
      console.error('Error loading assignable users:', error);
    }
  };

  const loadTeamMembers = async () => {
    if (!currentUser || currentUser.role !== 'pm') return;
    
    try {
      const members = await teamApi.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const loadAvailableEmployees = async () => {
    if (!currentUser || currentUser.role !== 'pm') return;
    
    setLoadingTeam(true);
    try {
      const employees = await teamApi.getAvailableEmployees();
      setAvailableEmployees(employees);
    } catch (error) {
      console.error('Error loading available employees:', error);
      alert('Failed to load available employees');
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleToggleTeamMember = async (employeeId: number, isCurrentlyInTeam: boolean) => {
    try {
      if (isCurrentlyInTeam) {
        await teamApi.removeMember(employeeId);
        alert('Team member removed successfully!');
      } else {
        await teamApi.addMember(employeeId);
        alert('Team member added successfully!');
      }
      
      // Reload data
      await loadTeamMembers();
      await loadAvailableEmployees();
    } catch (error: any) {
      console.error('Error toggling team member:', error);
      alert(error.response?.data?.message || 'Failed to update team');
    }
  };

  // Fungsi untuk handle delete task
  const handleDeleteTask = async () => {
    if (!taskToDelete || !currentUser) return;
    
    // Check permissions - only assigner or supervisor can delete
    if (currentUser.role === 'employee') {
      alert('You do not have permission to delete tasks');
      return;
    }
    
    if (currentUser.role === 'pm' && taskToDelete.assigner !== currentUser.name) {
      alert('You can only delete tasks that you assigned');
      return;
    }
    
    setIsDeleting(true);
    try {
      await tasksApi.delete(taskToDelete.id);
      
      // Close modal
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      
      // Reload tasks
      await loadTasks();
      
      alert(`Task "${taskToDelete.title}" has been deleted successfully!`);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Theme colors berdasarkan tema
  const themeColors = useMemo(() => {
    return theme.isDayTime ? {
      bg: "bg-white",
      text: "text-gray-900",
      textLight: "text-gray-600",
      textLighter: "text-gray-500",
      border: "border-gray-200",
      borderLight: "border-gray-100",
      bgLight: "bg-gray-50",
      cardBg: "bg-white",
      shadow: "shadow-sm",
      heroOverlay: "bg-white/70"
    } : {
      bg: "bg-gray-900",
      text: "text-gray-100",
      textLight: "text-gray-300",
      textLighter: "text-gray-400",
      border: "border-gray-700",
      borderLight: "border-gray-800",
      bgLight: "bg-gray-800",
      cardBg: "bg-gray-800",
      shadow: "shadow-lg shadow-black/20",
      heroOverlay: "bg-gray-900/70"
    };
  }, [theme.isDayTime]);

  // Pisahkan tasks untuk PM menjadi dua kategori
  const pmTasksFromSupervisor = useMemo(() => {
    return tasks.filter(task => 
      currentUser?.role === 'pm' && 
      task.assignee === currentUser.name && 
      task.assigner && 
      task.assigner !== currentUser.name
    );
  }, [tasks, currentUser]);

  const pmTasksToTeam = useMemo(() => {
    return tasks.filter(task => 
      currentUser?.role === 'pm' && 
      task.assigner === currentUser.name && 
      task.assignee !== currentUser.name
    );
  }, [tasks, currentUser]);

  // Filter tasks berdasarkan role
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    // Filter berdasarkan role pengguna
    if (currentUser?.role === 'employee') {
      // Employee hanya melihat task yang diassign ke dia
      filtered = filtered.filter(task => task.assignee === currentUser.name);
    } else if (currentUser?.role === 'pm') {
      // PM melihat task yang diassign ke dia DAN ke timnya (dalam department yang sama)
      filtered = filtered.filter(task => 
        task.assignee === currentUser.name || 
        (task.department === currentUser.department && task.assigner === currentUser.name)
      );
    }
    // Supervisor melihat semua task (tidak difilter)
    
    // Filter by status
    if (selectedFilter !== "all") {
      filtered = filtered.filter(task => task.status === selectedFilter);
    }
    
    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }
    
    // Filter by department (hanya untuk supervisor)
    if (currentUser?.role === 'supervisor' && selectedDepartment !== "all") {
      filtered = filtered.filter(task => task.department === selectedDepartment);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.assignee.toLowerCase().includes(term) ||
        task.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [tasks, selectedFilter, selectedPriority, selectedDepartment, searchTerm, currentUser]);

  // ============================================
  // STATS CALCULATION
  // ============================================

  // Hitung statistik berdasarkan role
  const stats = useMemo(() => {
    // Tentukan tasks mana yang dihitung berdasarkan role
    let relevantTasks = tasks; // Gunakan tasks asli yang belum difilter
    
    if (currentUser?.role === 'employee') {
      // Employee: hanya task yang assigned ke dia
      relevantTasks = tasks.filter(task => task.assignee === currentUser.name);
    } else if (currentUser?.role === 'pm') {
      // PM: 
      // 1. Task dari supervisor ke PM (task.assignee === PM.name)
      // 2. Task dari PM ke tim (task.assigner === PM.name && task.assignee !== PM.name)
      relevantTasks = tasks.filter(task => 
        task.assignee === currentUser.name || // Task yang assigned ke PM
        (task.assigner === currentUser.name && task.assignee !== currentUser.name) // Task yang PM assign ke tim
      );
    }
    // Supervisor: semua task (tidak difilter, pakai tasks langsung)
    
    const total = relevantTasks.length;
    
    // Completed: task dengan status 'completed' ATAU progress === 100
    const completed = relevantTasks.filter(t => 
      t.status === 'completed' || t.progress === 100
    ).length;
    
    // In Progress: task dengan progress > 0 tapi < 100 DAN status bukan 'completed'
    const inProgress = relevantTasks.filter(t => 
      t.progress > 0 && 
      t.progress < 100 && 
      t.status !== 'completed'
    ).length;
    
    // Pending: task dengan progress === 0 dan status masih 'pending'
    const pending = relevantTasks.filter(t => 
      (t.progress === 0 || !t.progress) && 
      t.status === 'pending'
    ).length;
    
    // Overdue: task yang melewati deadline DAN belum selesai
    const overdue = relevantTasks.filter(t => {
      const isOverdue = new Date(t.deadline) < new Date();
      const notCompleted = t.status !== 'completed' && t.progress !== 100;
      return isOverdue && notCompleted;
    }).length;
    
    return { total, completed, inProgress, pending, overdue };
  }, [tasks, currentUser]);

  // Update getAssignableUsers function untuk menggunakan data dari API
  const getAssignableUsers = () => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'supervisor') {
      // Supervisor bisa assign ke SEMUA PM dan employee dari API
      return assignableUsers;
    } else if (currentUser.role === 'pm') {
      // PM hanya bisa assign ke team members-nya
      return teamMembers.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        department: member.department
      }));
    }
    
    return [];
  };

  // Handle checkbox subtask (untuk employee DAN PM)
  const handleSubtaskToggle = async (taskId: number, subtaskId: number) => {
    if (!currentUser) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    
    // Check permissions
    if (currentUser.role === 'employee' && task.assignee !== currentUser.name) return;
    if (currentUser.role === 'pm' && task.assignee !== currentUser.name) return;
    
    try {
      const subtask = task.subtasks.find(st => st.id === subtaskId);
      if (!subtask) return;

      await tasksApi.updateSubtask(taskId, subtaskId, !subtask.completed);
      
      // Reload tasks
      await loadTasks();
      
      alert('Subtask updated successfully!');
    } catch (error) {
      console.error('Error updating subtask:', error);
      alert('Failed to update subtask');
    }
  };

  // Handle submit progress (untuk employee DAN PM)
  const handleSubmitProgress = async (taskId: number) => {
    if (!currentUser) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check permissions
    if (currentUser.role === 'employee' && task.assignee !== currentUser.name) return;
    if (currentUser.role === 'pm' && task.assignee !== currentUser.name) return;
    
    try {
      // Calculate progress from subtasks
      const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
      const totalSubtasks = task.subtasks?.length || 0;
      const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
      
      await tasksApi.updateProgress(taskId, progress);
      
      // Reload tasks
      await loadTasks();
      
      alert(`Progress for task "${task.title}" submitted successfully!`);
    } catch (error) {
      console.error('Error submitting progress:', error);
      alert('Failed to submit progress');
    }
  };

  // Handle assign new task (untuk supervisor dan PM)
  const handleAssignNewTask = async () => {
    if (!currentUser || (currentUser.role !== 'supervisor' && currentUser.role !== 'pm')) return;
    
    try {
      // Validasi input
      if (!newTask.title.trim()) {
        alert('Please enter a task title');
        return;
      }
      
      if (!newTask.assignee) {
        alert('Please select an assignee');
        return;
      }
      
      if (!newTask.deadline) {
        alert('Please select a deadline');
        return;
      }
      
      const assigneeUser = getAssignableUsers().find(u => u.name === newTask.assignee);
      if (!assigneeUser) {
        alert('Please select a valid assignee');
        return;
      }
      
      // PENTING: Jangan kirim id untuk subtasks, biarkan backend yang generate
      const subtasksToSend = newTask.subtasks
        .filter(st => st.description.trim()) // Hanya kirim subtask yang ada deskripsinya
        .map(st => ({
          description: st.description.trim(),
          completed: false
          // JANGAN kirim id di sini!
        }));
      
      await tasksApi.create({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        assignee_id: assigneeUser.id,
        assigner_id: currentUser.id,
        department: currentUser.role === 'pm' ? currentUser.department : assigneeUser.department,
        deadline: newTask.deadline,
        estimated_hours: newTask.estimatedHours,
        status: 'pending',
        tags: ["New"],
        subtasks: subtasksToSend
      });
      
      // Save title and assignee for success message before resetting
      const taskTitle = newTask.title;
      const assigneeName = newTask.assignee;
      
      // Reset form
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assignee: "",
        deadline: "",
        estimatedHours: 8,
        subtasks: []
      });
      setIsNewTaskModalOpen(false);
      
      // Reload tasks
      await loadTasks();
      
      alert(`Task "${taskTitle}" assigned to ${assigneeName} successfully!`);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  // Add subtask to new task form - PERBAIKAN DI SINI
  const handleAddSubtask = () => {
    setNewTask(prev => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { 
          id: Date.now(), // Gunakan timestamp sebagai id sementara yang unik
          description: "", 
          completed: false 
        }
      ]
    }));
  };

  // Render Task Item
  const renderTaskItem = (task: Task, isFromSupervisor = false) => {
    // Check if current user can edit subtasks
    const canEditSubtasks = currentUser && (
      (currentUser.role === 'employee' && task.assignee === currentUser.name) ||
      (currentUser.role === 'pm' && task.assignee === currentUser.name)
    );
    
    // Check if current user can delete this task
    const canDelete = currentUser && (
      currentUser.role === 'supervisor' ||
      (currentUser.role === 'pm' && task.assigner === currentUser.name)
    );

    return (
      <div key={task.id} className={`px-6 py-4 hover:${themeColors.bgLight}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                task.priority === "high" 
                  ? "bg-red-100 text-red-800"
                  : task.priority === "medium"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                task.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : task.status === "in-progress"
                  ? "bg-blue-100 text-blue-800"
                  : task.status === "review"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
              {new Date(task.deadline) < new Date() && task.status !== 'completed' && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                  Overdue
                </span>
              )}
              {isFromSupervisor && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium flex items-center gap-1">
                  <SupervisorIcon />
                  From Supervisor
                </span>
              )}
            </div>
            
            <h4 className={`text-lg font-medium ${themeColors.text}`}>{task.title}</h4>
            <p className={`text-sm ${themeColors.textLight} mt-1`}>{task.description}</p>
            
            {/* Subtasks untuk Employee DAN PM pada task mereka sendiri */}
            {canEditSubtasks && task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className={`text-sm font-medium ${themeColors.text}`}>Subtasks:</h5>
                  <span className={`text-xs ${themeColors.textLight}`}>
                    {task.subtasks.filter(st => st.completed).length} of {task.subtasks.length} completed
                  </span>
                </div>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleSubtaskToggle(task.id, subtask.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        disabled={task.status === 'completed'}
                      />
                      <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : themeColors.text}`}>
                        {subtask.description}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Progress summary */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs ${themeColors.textLight}`}>
                    Update your progress by checking completed subtasks
                  </span>
                  <button 
                    onClick={() => handleSubmitProgress(task.id)}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                  >
                    Submit Progress
                  </button>
                </div>
              </div>
            )}
            
            {/* Show subtasks read-only jika user tidak bisa edit */}
            {!canEditSubtasks && task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-4">
                <h5 className={`text-sm font-medium ${themeColors.text} mb-2`}>Subtasks:</h5>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        readOnly
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : themeColors.text}`}>
                        {subtask.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <UserIcon />
                <span className={`text-sm ${themeColors.textLight}`}>
                  {task.assigner ? `${task.assigner} → ${task.assignee}` : task.assignee}
                  {task.assigner === currentUser?.name && " (Assigned by you)"}
                </span>
              </div>
              {(currentUser?.role === 'supervisor' || currentUser?.role === 'pm') && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${themeColors.textLight}`}>{task.department}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ClockIcon />
                <span className={`text-sm ${themeColors.textLight}`}>
                  Due: {new Date(task.deadline).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${themeColors.textLight}`}>Est: {task.estimatedHours}h</span>
                {task.actualHours && (
                  <span className={`text-sm ${themeColors.textLight}`}>• Actual: {task.actualHours}h</span>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${themeColors.textLight}`}>Progress</span>
                <span className="text-sm font-medium">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    task.progress < 30 ? "bg-red-500" :
                    task.progress < 70 ? "bg-amber-500" :
                    "bg-green-500"
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${themeColors.textLight}`}>
                  {task.subtasks ? `${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length} subtasks completed` : 'No subtasks'}
                </span>
                {canEditSubtasks && (
                  <span className={`text-xs ${themeColors.textLight}`}>
                    Click subtasks to update progress
                  </span>
                )}
              </div>
            </div>
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {task.tags.map((tag, idx) => (
                  <span key={idx} className={`px-2 py-1 text-xs ${theme.isDayTime ? 'bg-gray-100 text-gray-700' : 'bg-gray-700 text-gray-300'} rounded`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* ACTION BUTTONS */}
          <div className="ml-6 flex flex-col gap-2">
            {currentUser?.role === 'employee' && task.assignee === currentUser.name ? (
              <>
                <button 
                  onClick={() => handleSubmitProgress(task.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit
                </button>
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} text-sm border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} flex items-center gap-2 justify-center`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
              </>
            ) : currentUser?.role === 'pm' && task.assignee === currentUser.name ? (
              <>
                <button 
                  onClick={() => handleSubmitProgress(task.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Update
                </button>
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} text-sm border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} flex items-center gap-2 justify-center`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage
                </button>
                
                {/* DELETE BUTTON - Only for users who can delete */}
                {canDelete && (
                  <button 
                    onClick={() => {
                      setTaskToDelete(task);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-2 justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        {task.comments && task.comments.length > 0 && (
          <div className={`mt-4 pt-4 border-t ${themeColors.border}`}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return null; // Akan di-redirect oleh useEffect
  }

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url("${theme.backgroundImage}")`,
        }}
      >
        <div className={`absolute inset-0 ${themeColors.heroOverlay}`} />
        
        <div className="relative z-10 text-center px-4 w-full">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${themeColors.text}`}>
            {currentUser.role === 'employee' ? 'My ' : ''}Task <span className="text-blue-600">Management</span>
          </h1>
          <p className={`text-lg md:text-xl ${themeColors.textLight} max-w-3xl mx-auto`}>
            {currentUser?.role === 'supervisor' 
              ? 'Monitor and assign tasks to PMs and employees'
              : currentUser?.role === 'pm'
              ? `Manage tasks in ${currentUser.department} department`
              : 'Track and update your assigned tasks'}
          </p>
        </div>
      </div>

      <div className={`min-h-screen ${themeColors.bg}`}>
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header dengan Breadcrumb */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <nav className="flex mb-4" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <Link href="/" className="text-gray-700 hover:text-blue-600">
                        Dashboard
                      </Link>
                    </li>
                    <li aria-current="page">
                      <div className="flex items-center">
                        <span className="mx-2 text-gray-500">/</span>
                        <span className={`${themeColors.text} font-medium`}>Tasks</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                
                <h2 className={`text-2xl font-bold ${themeColors.text}`}>
                  {currentUser?.role === 'supervisor' 
                    ? 'Task Assignment & Monitoring'
                    : currentUser?.role === 'pm'
                    ? `${currentUser.department} Department Tasks`
                    : 'My Tasks & Progress'}
                </h2>
                <p className={`${themeColors.textLight} mt-1`}>
                  {currentUser?.role === 'supervisor' 
                    ? 'Assign tasks to PMs and monitor all progress'
                    : currentUser?.role === 'pm'
                    ? 'Assign tasks to your team and track progress'
                    : 'Update your task progress and submit reports'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/"
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} flex items-center gap-2`}
                >
                  ← Back to Dashboard
                </Link>
                
                {/* Show Manage Team button only for PM */}
                {currentUser?.role === 'pm' && (
                  <button 
                    onClick={() => {
                      setIsTeamModalOpen(true);
                      loadAvailableEmployees();
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Manage Team ({teamMembers.length})
                  </button>
                )}
                
                {/* Show Assign Task button only for Supervisor and PM */}
                {(currentUser?.role === 'supervisor' || currentUser?.role === 'pm') && (
                  <button 
                    onClick={() => {
                      if (currentUser.role === 'pm' && teamMembers.length === 0) {
                        alert('Please add team members first before assigning tasks');
                        setIsTeamModalOpen(true);
                        loadAvailableEmployees();
                        return;
                      }
                      setIsNewTaskModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {currentUser.role === 'supervisor' ? 'Assign New Task' : 'Assign to Team'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {/* Stats Cards */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* TOTAL TASKS */}
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>Total Tasks</p>
                      <p className={`text-3xl font-bold ${themeColors.text} mt-2`}>{stats.total}</p>
                    </div>
                    <div className={`p-3 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                    <p className={`text-xs ${themeColors.textLighter}`}>
                      {currentUser?.role === 'employee' 
                        ? 'Your assigned tasks'
                        : currentUser?.role === 'pm'
                        ? 'Tasks from supervisor + tasks to team'
                        : 'All company tasks'}
                    </p>
                  </div>
                </div>
                
                {/* COMPLETED TASKS */}
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>Completed</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                    </div>
                    <div className={`p-3 ${theme.isDayTime ? 'bg-green-50' : 'bg-green-900/20'} rounded-lg`}>
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs ${themeColors.textLighter}`}>
                        {stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(1)}% completion rate` : 'No tasks'}
                      </p>
                      {stats.completed > 0 && (
                        <span className="text-xs font-medium text-green-600">
                          ↑ {stats.completed}/{stats.total}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* IN PROGRESS */}
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>In Progress</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                    </div>
                    <div className={`p-3 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                    <div className="flex justify-between items-center mb-1">
                      <p className={`text-xs ${themeColors.textLighter}`}>
                        Being worked on
                      </p>
                      <span className={`text-xs font-medium ${themeColors.text}`}>
                        {stats.pending} pending
                      </span>
                    </div>
                    {stats.inProgress > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-blue-600 font-medium">
                          {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* OVERDUE */}
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>Overdue</p>
                      <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
                    </div>
                    <div className={`p-3 ${theme.isDayTime ? 'bg-red-50' : 'bg-red-900/20'} rounded-lg`}>
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.732-1.333-2.464 0L4.732 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                    <p className={`text-xs ${themeColors.textLight} mb-2`}>
                      Past deadline, not completed
                    </p>
                    {stats.overdue > 0 && stats.total > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{ width: `${(stats.overdue / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-red-600 font-medium">
                          {Math.round((stats.overdue / stats.total) * 100)}%
                        </span>
                      </div>
                    )}
                    {stats.overdue === 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium">All on track!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Filters dan Search */}
              <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6 mb-8`}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeColors.bgLight} ${themeColors.text}`}
                      />
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {/* Status Filter */}
                    <div className={`flex ${theme.isDayTime ? 'bg-gray-100' : 'bg-gray-800'} p-1 rounded-lg`}>
                      {(['all', 'pending', 'in-progress', 'completed'] as const).map(filter => (
                        <button
                          key={filter}
                          onClick={() => setSelectedFilter(filter)}
                          className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                            selectedFilter === filter 
                              ? `${theme.isDayTime ? 'bg-white text-blue-600' : 'bg-gray-700 text-white'} shadow-sm` 
                              : `${themeColors.textLight} hover:${themeColors.text}`
                          }`}
                        >
                          {filter === 'all' ? 'All' : 
                           filter === 'in-progress' ? 'In Progress' : 
                           filter}
                        </button>
                      ))}
                    </div>
                    
                    {/* Priority Filter */}
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className={`px-3 py-2 border ${themeColors.border} rounded-lg text-sm ${themeColors.bgLight} ${themeColors.text}`}
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    
                    {/* Department Filter (hanya untuk supervisor) */}
                    {currentUser?.role === 'supervisor' && (
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className={`px-3 py-2 border ${themeColors.border} rounded-lg text-sm ${themeColors.bgLight} ${themeColors.text}`}
                      >
                        <option value="all">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                      </select>
                    )}
                    
                    {/* View Mode Toggle */}
                    <div className={`flex ${theme.isDayTime ? 'bg-gray-100' : 'bg-gray-800'} p-1 rounded-lg`}>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md ${viewMode === "list" ? `${theme.isDayTime ? "bg-white" : "bg-gray-700"} shadow-sm` : ""}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode("board")}
                        className={`p-2 rounded-md ${viewMode === "board" ? `${theme.isDayTime ? "bg-white" : "bg-gray-700"} shadow-sm` : ""}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tasks Content */}
              {viewMode === "list" ? (
                // List View - Khusus untuk PM kita buat dua section terpisah
                currentUser?.role === 'pm' ? (
                  <div className="space-y-8">
                    {/* Section 1: Tasks dari Supervisor ke PM */}
                    <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border-2 border-blue-500 overflow-hidden`}>
                      <div className={`px-6 py-4 bg-blue-50 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} border-b ${themeColors.border}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 ${theme.isDayTime ? 'bg-blue-100' : 'bg-blue-900/30'} rounded-lg`}>
                              <SupervisorIcon />
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold ${themeColors.text}`}>Tasks From Supervisor</h3>
                              <p className={`text-sm ${themeColors.textLight}`}>
                                Tasks assigned to you by Supervisor ({pmTasksFromSupervisor.length} tasks)
                              </p>
                              <p className={`text-xs ${themeColors.textLight} mt-1`}>
                                Update your progress by checking completed subtasks
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 text-sm ${theme.isDayTime ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/30 text-blue-300'} rounded-full`}>
                            Direct Assignment
                          </div>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-gray-200">
                        {pmTasksFromSupervisor.length > 0 ? (
                          pmTasksFromSupervisor.map(task => renderTaskItem(task, true))
                        ) : (
                          <div className="px-6 py-12 text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className={`mt-4 text-lg font-medium ${themeColors.text}`}>No tasks from supervisor</h3>
                            <p className={`mt-1 ${themeColors.textLight}`}>No tasks have been assigned to you by supervisor yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Section 2: Tasks dari PM ke Team */}
                    <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border-2 border-green-500 overflow-hidden`}>
                      <div className={`px-6 py-4 bg-green-50 ${theme.isDayTime ? 'bg-green-50' : 'bg-green-900/20'} border-b ${themeColors.border}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 ${theme.isDayTime ? 'bg-green-100' : 'bg-green-900/30'} rounded-lg`}>
                              <TeamIcon />
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold ${themeColors.text}`}>Team Tasks</h3>
                              <p className={`text-sm ${themeColors.textLight}`}>
                                Tasks assigned by you to your team ({pmTasksToTeam.length} tasks)
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 text-sm ${theme.isDayTime ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-300'} rounded-full`}>
                            Team Management
                          </div>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-gray-200">
                        {pmTasksToTeam.length > 0 ? (
                          pmTasksToTeam.map(task => renderTaskItem(task, false))
                        ) : (
                          <div className="px-6 py-12 text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className={`mt-4 text-lg font-medium ${themeColors.text}`}>No team tasks</h3>
                            <p className={`mt-1 ${themeColors.textLight}`}>You haven't assigned any tasks to your team yet</p>
                            <button 
                              onClick={() => {
                                if (teamMembers.length === 0) {
                                  alert('Please add team members first before assigning tasks');
                                  setIsTeamModalOpen(true);
                                  loadAvailableEmployees();
                                  return;
                                }
                                setIsNewTaskModalOpen(true);
                              }}
                              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                              Assign First Task
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View untuk Employee dan Supervisor
                  <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} overflow-hidden mb-8`}>
                    <div className={`px-6 py-4 border-b ${themeColors.border} ${themeColors.bgLight}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-lg font-semibold ${themeColors.text}`}>Task List</h3>
                          <p className={`text-sm ${themeColors.textLight}`}>
                            {currentUser?.role === 'employee' 
                              ? 'Your assigned tasks - update progress by checking subtasks'
                              : `Showing ${filteredTasks.length} tasks`}
                          </p>
                        </div>
                        <div className={`text-sm ${themeColors.textLighter}`}>
                          {(() => {
                            if (currentUser?.role === 'supervisor') return 'Assigner → Assignee';
                            if (currentUser?.role === 'employee') return 'Your Tasks';
                            return '';
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {filteredTasks.map((task) => renderTaskItem(task, false))}
                    </div>
                    
                    {filteredTasks.length === 0 && (
                      <div className="px-6 py-12 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className={`mt-4 text-lg font-medium ${themeColors.text}`}>No tasks found</h3>
                        <p className={`mt-1 ${themeColors.textLight}`}>
                          {currentUser?.role === 'employee' 
                            ? 'No tasks assigned to you yet'
                            : 'Try adjusting your filters'}
                        </p>
                      </div>
                    )}
                    
                    <div className={`px-6 py-4 border-t ${themeColors.border} ${themeColors.bgLight}`}>
                      <div className="flex items-center justify-between">
                        <div className={`text-sm ${themeColors.textLight}`}>
                          Showing {Math.min(filteredTasks.length, 10)} of {filteredTasks.length} tasks
                        </div>
                        <div className="flex gap-2">
                          <button className={`px-3 py-1 border ${themeColors.border} rounded text-sm hover:${themeColors.bgLight}`}>
                            ← Previous
                          </button>
                          <button className={`px-3 py-1 border ${themeColors.border} rounded text-sm hover:${themeColors.bgLight}`}>
                            Next →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                // Board View (Kanban)
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {(['pending', 'in-progress', 'review', 'completed'] as const).map((status) => {
                    const columnTasks = filteredTasks.filter(task => task.status === status);
                    const columnTitle = status.charAt(0).toUpperCase() + status.slice(1);
                    const columnColor = {
                      pending: 'border-gray-300',
                      'in-progress': 'border-blue-300',
                      review: 'border-purple-300',
                      completed: 'border-green-300'
                    }[status];
                    
                    return (
                      <div key={status} className={`${themeColors.bgLight} rounded-lg border ${themeColors.border}`}>
                        <div className={`px-4 py-3 border-b-4 ${columnColor} ${themeColors.cardBg} rounded-t-lg`}>
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${themeColors.text}`}>{columnTitle}</h3>
                            <span className={`px-2 py-1 text-xs ${theme.isDayTime ? 'bg-gray-200' : 'bg-gray-700'} rounded-full`}>{columnTasks.length}</span>
                          </div>
                        </div>
                        <div className="p-3 space-y-3 min-h-[500px]">
                          {columnTasks.map(task => (
                            <div key={task.id} className={`${themeColors.cardBg} p-4 rounded-lg ${themeColors.shadow} border ${themeColors.border}`}>
                              <div className="flex items-start justify-between mb-2">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  task.priority === "high" 
                                    ? "bg-red-100 text-red-800"
                                    : task.priority === "medium"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  {task.priority.charAt(0).toUpperCase()}
                                </span>
                                {currentUser?.role === 'pm' && task.assigner === "Alex Johnson" && (
                                  <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    From Sup
                                  </span>
                                )}
                                <button className="text-gray-400 hover:text-gray-600">
                                  ⋮
                                </button>
                              </div>
                              <h4 className={`font-medium ${themeColors.text} mb-2`}>{task.title}</h4>
                              <div className={`flex items-center justify-between text-sm ${themeColors.textLight} mb-3`}>
                                <span>Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span>{task.estimatedHours}h</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${theme.isDayTime ? 'bg-gray-200' : 'bg-gray-700'} flex items-center justify-center text-xs`}>
                                    {task.assignee.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <span className={`text-xs ${themeColors.textLight}`}>
                                    {currentUser?.role === 'supervisor' 
                                      ? `${task.assigner?.split(' ').map(n => n[0]).join('')}→${task.assignee.split(' ').map(n => n[0]).join('')}`
                                      : task.assignee}
                                  </span>
                                </div>
                                <div className="text-xs font-medium">{task.progress}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Task Monitoring untuk Supervisor/PM */}
              {(currentUser?.role === 'supervisor' || currentUser?.role === 'pm') && (
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6 mb-8`}>
                  <h3 className={`text-lg font-semibold ${themeColors.text} mb-6`}>
                    {currentUser.role === 'supervisor' ? 'Department Monitoring' : 'Team Progress'}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className={`text-sm font-medium ${themeColors.textLight} mb-4`}>
                        {currentUser.role === 'supervisor' ? 'Completion Rate by PM' : 'Progress by Team Member'}
                      </h4>
                      <div className="space-y-4">
                        {currentUser.role === 'supervisor' ? (
                          // Supervisor melihat progress per PM
                          <>
                            {['Sarah Chen (Engineering)', 'Lisa Wong (Marketing)', 'Tom Wilson (Sales)'].map(pm => (
                              <div key={pm} className="flex items-center justify-between">
                                <span className={`text-sm ${themeColors.textLight}`}>{pm}</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{Math.floor(Math.random() * 60) + 40}%</span>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          // PM melihat progress per team member
                          <>
                            {teamMembers.map(member => (
                              <div key={member.id} className="flex items-center justify-between">
                                <span className={`text-sm ${themeColors.textLight}`}>{member.name}</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{Math.floor(Math.random() * 60) + 40}%</span>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${themeColors.textLight} mb-4`}>Task Distribution</h4>
                      <div className="space-y-4">
                        {['High Priority', 'Medium Priority', 'Low Priority'].map(priority => (
                          <div key={priority} className="flex items-center justify-between">
                            <span className={`text-sm ${themeColors.textLight}`}>{priority}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">
                                {priority === 'High Priority' ? filteredTasks.filter(t => t.priority === 'high').length : 
                                 priority === 'Medium Priority' ? filteredTasks.filter(t => t.priority === 'medium').length : 
                                 filteredTasks.filter(t => t.priority === 'low').length} tasks
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Employee-specific content */}
              {currentUser?.role === 'employee' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Task Statistics */}
                  <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text} mb-6`}>Your Performance</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm ${themeColors.textLight}`}>Monthly Completion Rate</span>
                          <span className="text-sm font-medium text-green-600">+12%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
                          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                          <div className={`text-sm ${themeColors.textLight}`}>Tasks Completed</div>
                        </div>
                        <div className={`p-4 ${theme.isDayTime ? 'bg-green-50' : 'bg-green-900/20'} rounded-lg`}>
                          <div className="text-2xl font-bold text-green-600">
                            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                          </div>
                          <div className={`text-sm ${themeColors.textLight}`}>Completion Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text} mb-6`}>Quick Actions</h3>
                    <div className="space-y-4">
                      <button className={`w-full p-4 border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} text-left flex items-center justify-between`}>
                        <div>
                          <div className={`font-medium ${themeColors.text}`}>Request Task Extension</div>
                          <div className={`text-sm ${themeColors.textLight} mt-1`}>Need more time on a task?</div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                      <button className={`w-full p-4 border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} text-left flex items-center justify-between`}>
                        <div>
                          <div className={`font-medium ${themeColors.text}`}>Report Issue</div>
                          <div className={`text-sm ${themeColors.textLight} mt-1`}>Report problems with assigned task</div>
                        </div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for Task Details */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${themeColors.text}`}>{selectedTask.title}</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`p-2 ${theme.isDayTime ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} rounded-lg`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-1`}>Description</label>
                  <p className={`${themeColors.text}`}>{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-1`}>Assignee</label>
                    <p className={`${themeColors.text}`}>{selectedTask.assignee}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-1`}>Assigned By</label>
                    <p className={`${themeColors.text}`}>{selectedTask.assigner}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-1`}>Department</label>
                    <p className={`${themeColors.text}`}>{selectedTask.department}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-1`}>Deadline</label>
                    <p className={`${themeColors.text}`}>
                      {new Date(selectedTask.deadline).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Subtasks</label>
                    <div className="space-y-2">
                      {selectedTask.subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            readOnly
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : themeColors.text}`}>
                            {subtask.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedTask.comments && selectedTask.comments.length > 0 && (
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Comments</label>
                    <div className="space-y-3">
                      {selectedTask.comments.map((comment) => (
                        <div key={comment.id} className={`p-3 rounded-lg ${theme.isDayTime ? 'bg-gray-50' : 'bg-gray-800'}`}>
                          <div className="flex justify-between items-start">
                            <span className={`font-medium ${themeColors.text}`}>{comment.userName}</span>
                            <span className={`text-xs ${themeColors.textLight}`}>{comment.timestamp}</span>
                          </div>
                          <p className={`text-sm ${themeColors.text} mt-1`}>{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Assigning New Task (Supervisor & PM) */}
      {isNewTaskModalOpen && (currentUser?.role === 'supervisor' || currentUser?.role === 'pm') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${themeColors.text}`}>
                  {currentUser.role === 'supervisor' ? 'Assign New Task' : 'Assign Task to Team'}
                </h3>
                <button 
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className={`p-2 ${theme.isDayTime ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} rounded-lg`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-1`}>Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-1`}>Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                    rows={3}
                    placeholder="Enter task description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.text} mb-1`}>Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as "low" | "medium" | "high" }))}
                      className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.text} mb-1`}>Assignee</label>
                    <select
                      value={newTask.assignee}
                      onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                      className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                    >
                      <option value="">Select assignee</option>
                      {getAssignableUsers().map(user => (
                        <option key={user.id} value={user.name}>
                          {user.name} ({user.role}, {user.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.text} mb-1`}>Deadline</label>
                    <input
                      type="date"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                      className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.text} mb-1`}>Estimated Hours</label>
                    <input
                      type="number"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 8 }))}
                      className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-sm font-medium ${themeColors.text}`}>Subtasks</label>
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Subtask
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newTask.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          disabled
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <input
                          type="text"
                          value={subtask.description}
                          onChange={(e) => {
                            const newSubtasks = newTask.subtasks.map(st => 
                              st.id === subtask.id ? { ...st, description: e.target.value } : st
                            );
                            setNewTask(prev => ({ ...prev, subtasks: newSubtasks }));
                          }}
                          className={`flex-1 px-3 py-1 border ${themeColors.border} rounded ${themeColors.bgLight} ${themeColors.text} text-sm`}
                          placeholder="Subtask description"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newSubtasks = newTask.subtasks.filter(st => st.id !== subtask.id);
                            setNewTask(prev => ({ ...prev, subtasks: newSubtasks }));
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {newTask.subtasks.length > 0 && (
                    <p className={`text-xs ${themeColors.textLight} mt-2`}>
                      Subtasks with empty descriptions will not be saved
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignNewTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={!newTask.title || !newTask.assignee || !newTask.deadline}
                >
                  Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} max-w-md w-full`}>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.732-1.333-2.464 0L4.732 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${themeColors.text} mb-2`}>Delete Task</h3>
                  <p className={`text-sm ${themeColors.textLight}`}>
                    Are you sure you want to delete this task?
                  </p>
                  <div className={`mt-3 p-3 ${theme.isDayTime ? 'bg-gray-50' : 'bg-gray-800'} rounded-lg`}>
                    <p className={`text-sm font-medium ${themeColors.text}`}>{taskToDelete.title}</p>
                    <p className={`text-xs ${themeColors.textLight} mt-1`}>
                      Assigned to: {taskToDelete.assignee}
                    </p>
                    {taskToDelete.subtasks && taskToDelete.subtasks.length > 0 && (
                      <p className={`text-xs ${themeColors.textLight} mt-1`}>
                        {taskToDelete.subtasks.length} subtask(s) will also be deleted
                      </p>
                    )}
                  </div>
                  <p className={`text-xs ${themeColors.textLight} mt-3`}>
                    ⚠️ This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                  }}
                  disabled={isDeleting}
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Management Modal (untuk PM) */}
      {isTeamModalOpen && currentUser?.role === 'pm' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${themeColors.text}`}>Manage Your Team</h3>
                  <p className={`text-sm ${themeColors.textLight} mt-1`}>
                    Select employees from {currentUser.department} department to add to your team
                  </p>
                </div>
                <button 
                  onClick={() => setIsTeamModalOpen(false)}
                  className={`p-2 ${theme.isDayTime ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} rounded-lg`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {loadingTeam ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className={`mb-6 p-4 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className={`text-sm font-medium ${themeColors.text}`}>Current Team Size: {teamMembers.length}</p>
                        <p className={`text-xs ${themeColors.textLight}`}>
                          You can only assign tasks to employees in your team
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {availableEmployees.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className={`${themeColors.text} font-medium`}>No employees available</p>
                        <p className={`text-sm ${themeColors.textLight} mt-1`}>
                          There are no employees in {currentUser.department} department
                        </p>
                      </div>
                    ) : (
                      availableEmployees.map((employee) => (
                        <div 
                          key={employee.id}
                          className={`flex items-center justify-between p-4 border ${themeColors.border} rounded-lg hover:${themeColors.bgLight}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${theme.isDayTime ? 'bg-blue-100' : 'bg-blue-900/30'} flex items-center justify-center`}>
                              <span className="text-sm font-medium text-blue-600">
                                {employee.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className={`font-medium ${themeColors.text}`}>{employee.name}</p>
                              <p className={`text-sm ${themeColors.textLight}`}>{employee.email}</p>
                              <p className={`text-xs ${themeColors.textLight}`}>{employee.department}</p>
                            </div>
                          </div>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={employee.isInTeam}
                              onChange={() => handleToggleTeamMember(employee.id, employee.isInTeam)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={`ml-3 text-sm ${employee.isInTeam ? 'text-blue-600 font-medium' : themeColors.textLight}`}>
                              {employee.isInTeam ? 'In Team' : 'Add to Team'}
                            </span>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}