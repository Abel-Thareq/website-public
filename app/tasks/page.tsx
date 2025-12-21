"use client";

import { useState, useEffect, useMemo } from "react";
import NavigationBar from "../components/navigationBar";
import Link from "next/link";
import { Task, TaskSubtask } from "../types/user";
import { useTheme } from "../providers/temaProvider";
import { useUser } from "../providers/userProvider";
import { useRouter } from "next/navigation";
import { tasksApi } from '../../lib/api';

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
  const { currentUser } = useUser();
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

  // Redirect ke home jika user berubah
  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  // Load tasks from API
  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser, selectedFilter, selectedPriority, selectedDepartment, searchTerm]);

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

  // Hitung statistik berdasarkan role
  const stats = useMemo(() => {
    // Tentukan tasks mana yang dihitung berdasarkan role
    let relevantTasks = tasks;
    
    if (currentUser?.role === 'employee') {
      relevantTasks = tasks.filter(task => task.assignee === currentUser.name);
    } else if (currentUser?.role === 'pm') {
      relevantTasks = tasks.filter(task => 
        task.assignee === currentUser.name || 
        (task.department === currentUser.department && task.assigner === currentUser.name)
      );
    }
    
    const total = relevantTasks.length;
    const completed = relevantTasks.filter(t => t.status === 'completed').length;
    const inProgress = relevantTasks.filter(t => t.status === 'in-progress').length;
    const pending = relevantTasks.filter(t => t.status === 'pending').length;
    const overdue = relevantTasks.filter(t => 
      new Date(t.deadline) < new Date() && t.status !== 'completed'
    ).length;
    
    return { total, completed, inProgress, pending, overdue };
  }, [tasks, currentUser]);

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
      const assigneeUser = getAssignableUsers().find(u => u.name === newTask.assignee);
      if (!assigneeUser) {
        alert('Please select a valid assignee');
        return;
      }
      
      await tasksApi.create({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignee_id: assigneeUser.id,
        assigner_id: currentUser.id,
        department: currentUser.role === 'pm' ? currentUser.department : assigneeUser.department,
        deadline: newTask.deadline,
        estimated_hours: newTask.estimatedHours,
        status: 'pending',
        tags: ["New"],
        subtasks: newTask.subtasks.map(st => ({
          description: st.description,
          completed: false
        }))
      });
      
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
      
      alert(`Task "${newTask.title}" assigned to ${newTask.assignee} successfully!`);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  // Add subtask to new task form
  const handleAddSubtask = () => {
    setNewTask(prev => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: prev.subtasks.length + 1, description: "", completed: false }
      ]
    }));
  };

  // Get assignable users berdasarkan role
  const getAssignableUsers = () => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'supervisor') {
      // Supervisor bisa assign ke semua PM dan employee
      return [
        { id: 2, name: "Sarah Chen", role: "pm", department: "Engineering" },
        { id: 3, name: "Lisa Wong", role: "pm", department: "Marketing" },
        { id: 4, name: "John Doe", role: "employee", department: "Engineering" },
        { id: 5, name: "Mike Brown", role: "employee", department: "Engineering" },
        { id: 6, name: "Jane Smith", role: "employee", department: "Marketing" }
      ];
    } else if (currentUser.role === 'pm') {
      // PM hanya bisa assign ke employee di department-nya
      return [
        { id: 4, name: "John Doe", role: "employee", department: "Engineering" },
        { id: 5, name: "Mike Brown", role: "employee", department: "Engineering" },
        { id: 7, name: "Alex Johnson", role: "employee", department: "Engineering" }
      ];
    }
    
    return [];
  };

  // Render Task Item
  const renderTaskItem = (task: Task, isFromSupervisor = false) => {
    // Check if current user can edit subtasks
    const canEditSubtasks = currentUser && (
      (currentUser.role === 'employee' && task.assignee === currentUser.name) ||
      (currentUser.role === 'pm' && task.assignee === currentUser.name)
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
          
          <div className="ml-6 flex flex-col gap-2">
            {/* Tombol berbeda berdasarkan role */}
            {currentUser?.role === 'employee' && task.assignee === currentUser.name ? (
              <>
                <button 
                  onClick={() => handleSubmitProgress(task.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  Submit Progress
                </button>
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} text-sm border ${themeColors.border} rounded-lg hover:${themeColors.bgLight}`}
                >
                  View Details
                </button>
              </>
            ) : currentUser?.role === 'pm' && task.assignee === currentUser.name ? (
              <>
                <button 
                  onClick={() => handleSubmitProgress(task.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  Update Progress
                </button>
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} text-sm border ${themeColors.border} rounded-lg hover:${themeColors.bgLight}`}
                >
                  View Details
                </button>
              </>
            ) : (
              <>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Manage
                </button>
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} text-sm border ${themeColors.border} rounded-lg hover:${themeColors.bgLight}`}
                >
                  Details
                </button>
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
                
                {/* Show Assign Task button only for Supervisor and PM */}
                {(currentUser?.role === 'supervisor' || currentUser?.role === 'pm') && (
                  <button 
                    onClick={() => setIsNewTaskModalOpen(true)}
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
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>Total Tasks</p>
                      <p className={`text-3xl font-bold ${themeColors.text} mt-2`}>{stats.total}</p>
                    </div>
                    <div className={`p-3 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                    <p className={`text-xs ${themeColors.textLighter}`}>
                      {currentUser?.role === 'employee' 
                        ? 'Your assigned tasks'
                        : currentUser?.role === 'pm'
                        ? `Tasks in ${currentUser.department}`
                        : 'All company tasks'}
                    </p>
                  </div>
                </div>
                
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>Completed</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                    </div>
                    <div className={`p-3 ${theme.isDayTime ? 'bg-green-50' : 'bg-green-900/20'} rounded-lg`}>
                      <CheckCircleIcon />
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <p className={`text-xs ${themeColors.textLighter} mt-1`}>
                      {stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(1)}% completion rate` : 'No tasks'}
                    </p>
                  </div>
                </div>
                
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>In Progress</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                    </div>
                    <div className={`p-3 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
                      <ClockIcon />
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                    <p className={`text-xs ${themeColors.textLighter}`}>
                      Actively being worked on
                    </p>
                  </div>
                </div>
                
                <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>Overdue</p>
                      <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
                    </div>
                    <div className={`p-3 ${theme.isDayTime ? 'bg-red-50' : 'bg-red-900/20'} rounded-lg`}>
                      <ExclamationIcon />
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                    <p className={`text-xs ${themeColors.textLighter}`}>
                      Past deadline
                    </p>
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
                              onClick={() => setIsNewTaskModalOpen(true)}
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
                            {['John Doe', 'Mike Brown', 'Alex Johnson'].map(member => (
                              <div key={member} className="flex items-center justify-between">
                                <span className={`text-sm ${themeColors.textLight}`}>{member}</span>
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
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    {newTask.subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2">
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
                            const newSubtasks = [...newTask.subtasks];
                            newSubtasks[index] = { ...subtask, description: e.target.value };
                            setNewTask(prev => ({ ...prev, subtasks: newSubtasks }));
                          }}
                          className={`flex-1 px-3 py-1 border ${themeColors.border} rounded ${themeColors.bgLight} ${themeColors.text} text-sm`}
                          placeholder="Subtask description"
                        />
                      </div>
                    ))}
                  </div>
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
    </>
  );
}