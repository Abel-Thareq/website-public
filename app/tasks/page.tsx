"use client";

import { useState, useEffect, useMemo } from "react";
import NavigationBar from "../components/navigationBar";
import Link from "next/link";
import { User, Task } from "../types/user";

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

export default function TasksPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Load current user
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
  }, []);

  // Generate tasks data berdasarkan role
  const tasksData = useMemo(() => {
    if (!currentUser) return [];

    const tasks: Task[] = [];
    
    if (currentUser.role === 'employee') {
      // Data untuk employee (John Doe)
      const employeeTasks = [
        // Current tasks (dari dashboard)
        {
          id: 1,
          title: "Fix Login Bug",
          description: "Fix authentication issue on login page for mobile users",
          status: "in-progress" as const,
          priority: "high" as const,
          assignee: "John Doe",
          department: "Engineering",
          deadline: "2023-12-18",
          progress: 75,
          createdAt: "2023-12-10",
          updatedAt: "2023-12-16",
          estimatedHours: 8,
          actualHours: 6,
          tags: ["Bug", "Authentication", "Mobile"],
          comments: [
            {
              id: 1,
              userId: "pm_001",
              userName: "Sarah Chen",
              comment: "Please prioritize this issue",
              timestamp: "2023-12-10 10:30"
            }
          ]
        },
        {
          id: 2,
          title: "Update Documentation",
          description: "Update API documentation for new endpoints",
          status: "pending" as const,
          priority: "medium" as const,
          assignee: "John Doe",
          department: "Engineering",
          deadline: "2023-12-19",
          progress: 30,
          createdAt: "2023-12-12",
          updatedAt: "2023-12-16",
          estimatedHours: 12,
          tags: ["Documentation", "API"],
          comments: []
        },
        {
          id: 3,
          title: "Code Review",
          description: "Review PR #245 for new feature implementation",
          status: "completed" as const,
          priority: "medium" as const,
          assignee: "John Doe",
          department: "Engineering",
          deadline: "2023-12-15",
          progress: 100,
          createdAt: "2023-12-14",
          updatedAt: "2023-12-15",
          completedAt: "2023-12-15",
          estimatedHours: 4,
          actualHours: 3.5,
          tags: ["Code Review"],
          comments: []
        },
        // Historical tasks
        {
          id: 4,
          title: "Implement User Dashboard",
          description: "Create new dashboard interface for user analytics",
          status: "completed" as const,
          priority: "high" as const,
          assignee: "John Doe",
          department: "Engineering",
          deadline: "2023-12-05",
          progress: 100,
          createdAt: "2023-11-20",
          updatedAt: "2023-12-05",
          completedAt: "2023-12-05",
          estimatedHours: 40,
          actualHours: 38,
          tags: ["Frontend", "Dashboard", "Analytics"],
          comments: [
            {
              id: 2,
              userId: "pm_001",
              userName: "Sarah Chen",
              comment: "Great work on the dashboard!",
              timestamp: "2023-12-05 16:45"
            }
          ]
        },
        {
          id: 5,
          title: "Optimize Database Queries",
          description: "Optimize slow database queries for reporting module",
          status: "completed" as const,
          priority: "high" as const,
          assignee: "John Doe",
          department: "Engineering",
          deadline: "2023-11-28",
          progress: 100,
          createdAt: "2023-11-15",
          updatedAt: "2023-11-28",
          completedAt: "2023-11-28",
          estimatedHours: 24,
          actualHours: 20,
          tags: ["Backend", "Database", "Optimization"],
          comments: []
        },
        {
          id: 6,
          title: "Mobile Responsive Fixes",
          description: "Fix mobile responsive issues across the application",
          status: "completed" as const,
          priority: "medium" as const,
          assignee: "John Doe",
          department: "Engineering",
          deadline: "2023-11-22",
          progress: 100,
          createdAt: "2023-11-10",
          updatedAt: "2023-11-22",
          completedAt: "2023-11-22",
          estimatedHours: 16,
          actualHours: 14,
          tags: ["Frontend", "Mobile", "Responsive"],
          comments: []
        },
        {
          id: 7,
          title: "API Integration Testing",
          description: "Write integration tests for new payment API",
          status: "completed" as const,
          priority: "low" as const,
          assignee: "John Doe",
          department: "Engineering",
          deadline: "2023-11-15",
          progress: 100,
          createdAt: "2023-11-01",
          updatedAt: "2023-11-15",
          completedAt: "2023-11-15",
          estimatedHours: 20,
          actualHours: 18,
          tags: ["Testing", "API", "Payment"],
          comments: []
        },
        {
          id: 8,
          title: "Performance Monitoring Setup",
          description: "Set up performance monitoring for production environment",
          status: "completed" as const,
          priority: "medium" as const,
          assignee: "John Doe",
          department: "Engineering",
          deadline: "2023-11-08",
          progress: 100,
          createdAt: "2023-10-25",
          updatedAt: "2023-11-08",
          completedAt: "2023-11-08",
          estimatedHours: 32,
          actualHours: 30,
          tags: ["DevOps", "Monitoring", "Performance"],
          comments: []
        }
      ];
      return employeeTasks;
    } else if (currentUser.role === 'pm') {
      // Data untuk PM (Engineering department)
      const teamMembers = ["Tom Wilson", "Jane Smith", "Mike Brown", "Sarah Chen", "Alex Johnson", "Lisa Wong"];
      const departments = ["Engineering"];
      
      for (let i = 0; i < 30; i++) {
        const statuses: Task["status"][] = ["pending", "in-progress", "completed", "review"];
        const priorities: Task["priority"][] = ["low", "medium", "high"];
        const assignee = teamMembers[Math.floor(Math.random() * teamMembers.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const progress = status === "completed" ? 100 : status === "review" ? 90 : Math.floor(Math.random() * 80) + 10;
        
        tasks.push({
          id: i + 1,
          title: `Task ${i + 1}: ${["Implement", "Fix", "Update", "Review", "Test", "Document"][Math.floor(Math.random() * 6)]} ${["API", "UI", "Database", "Feature", "Bug", "Security"][Math.floor(Math.random() * 6)]}`,
          description: `Detailed description for task ${i + 1} in engineering department`,
          status,
          priority,
          assignee,
          department: departments[0],
          deadline: `2023-12-${15 + Math.floor(Math.random() * 10)}`,
          progress,
          createdAt: "2023-12-01",
          updatedAt: "2023-12-16",
          estimatedHours: Math.floor(Math.random() * 40) + 8,
          actualHours: status === "completed" ? Math.floor(Math.random() * 40) + 8 : undefined,
          tags: [["Frontend", "Backend", "Database", "Testing"][Math.floor(Math.random() * 4)]],
          comments: []
        });
      }
    } else {
      // Data untuk supervisor (semua departemen)
      const teamMembers = ["Tom Wilson", "Jane Smith", "Mike Brown", "Sarah Chen", "Alex Johnson", "Lisa Wong", "David Kim", "Maria Garcia"];
      const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations"];
      
      for (let i = 0; i < 50; i++) {
        const statuses: Task["status"][] = ["pending", "in-progress", "completed", "review"];
        const priorities: Task["priority"][] = ["low", "medium", "high"];
        const assignee = teamMembers[Math.floor(Math.random() * teamMembers.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const progress = status === "completed" ? 100 : status === "review" ? 90 : Math.floor(Math.random() * 80) + 10;
        
        tasks.push({
          id: i + 1,
          title: `Task ${i + 1}: ${["Implement", "Fix", "Update", "Review", "Test", "Document"][Math.floor(Math.random() * 6)]} ${["API", "UI", "Database", "Feature", "Bug", "Security"][Math.floor(Math.random() * 6)]}`,
          description: `Detailed description for task ${i + 1} in ${department} department`,
          status,
          priority,
          assignee,
          department,
          deadline: `2023-12-${15 + Math.floor(Math.random() * 10)}`,
          progress,
          createdAt: "2023-12-01",
          updatedAt: "2023-12-16",
          estimatedHours: Math.floor(Math.random() * 40) + 8,
          actualHours: status === "completed" ? Math.floor(Math.random() * 40) + 8 : undefined,
          tags: [["Urgent", "Important", "Routine"][Math.floor(Math.random() * 3)]],
          comments: []
        });
      }
    }
    
    return tasks;
  }, [currentUser]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasksData;
    
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
  }, [tasksData, selectedFilter, selectedPriority, selectedDepartment, searchTerm, currentUser]);

  // Hitung statistik
  const stats = useMemo(() => {
    const total = tasksData.length;
    const completed = tasksData.filter(t => t.status === 'completed').length;
    const inProgress = tasksData.filter(t => t.status === 'in-progress').length;
    const pending = tasksData.filter(t => t.status === 'pending').length;
    const overdue = tasksData.filter(t => 
      new Date(t.deadline) < new Date() && t.status !== 'completed'
    ).length;
    
    return { total, completed, inProgress, pending, overdue };
  }, [tasksData]);

  // Departments untuk filter (hanya untuk supervisor)
  const departments = useMemo(() => {
    if (currentUser?.role !== 'supervisor') return [];
    return ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please login to view tasks</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: 'url("/background.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-white/70" />
        
        <div className="relative z-10 text-center px-4 w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {currentUser.role === 'employee' ? 'My ' : ''}Task <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            {currentUser.role === 'supervisor' 
              ? 'Track and manage tasks across all departments'
              : currentUser.role === 'pm'
              ? `Manage ${currentUser.department} department tasks`
              : 'Track your personal tasks and assignments'}
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
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
                        <span className="text-gray-900 font-medium">Tasks</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentUser.role === 'supervisor' 
                    ? 'Company Task Management'
                    : currentUser.role === 'pm'
                    ? `${currentUser.department} Department Tasks`
                    : 'My Tasks & Assignments'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentUser.role === 'supervisor' 
                    ? 'Monitor task progress across all teams'
                    : currentUser.role === 'pm'
                    ? 'Assign and track team member tasks'
                    : 'View all your current and completed tasks'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/"
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  ← Back to Dashboard
                </Link>
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {currentUser.role === 'employee' ? 'New Task' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'employee' 
                    ? 'Total tasks assigned to you'
                    : `${currentUser.role === 'pm' ? 'Team' : 'Company'} tasks`}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(1)}% completion rate` : 'No tasks'}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ClockIcon />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Actively being worked on
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <ExclamationIcon />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Past deadline
                </p>
              </div>
            </div>
          </div>
          
          {/* Filters dan Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Status Filter */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {(['all', 'pending', 'in-progress', 'completed', 'review'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                        selectedFilter === filter 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
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
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                
                {/* Department Filter (hanya untuk supervisor) */}
                {currentUser.role === 'supervisor' && (
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept === 'All Departments' ? 'all' : dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                )}
                
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("board")}
                    className={`p-2 rounded-md ${viewMode === "board" ? "bg-white shadow-sm" : ""}`}
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
            // List View
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Task List</h3>
                    <p className="text-sm text-gray-600">
                      {currentUser.role === 'employee' 
                        ? 'Your complete task history'
                        : `Showing ${filteredTasks.length} tasks`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Sorted by: Due Date
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
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
                        </div>
                        
                        <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <UserIcon />
                            <span className="text-sm text-gray-600">{task.assignee}</span>
                          </div>
                          {currentUser.role !== 'employee' && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{task.department}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <ClockIcon />
                            <span className="text-sm text-gray-600">
                              Due: {new Date(task.deadline).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Est: {task.estimatedHours}h</span>
                            {task.actualHours && (
                              <span className="text-sm text-gray-600">• Actual: {task.actualHours}h</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
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
                        </div>
                        
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {task.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6 flex flex-col gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                          {currentUser.role === 'employee' ? 'Update' : 'Manage'}
                        </button>
                        <button className="px-4 py-2 bg-white text-gray-700 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          Details
                        </button>
                      </div>
                    </div>
                    
                    {task.comments && task.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {filteredTasks.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your filters</p>
                </div>
              )}
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(filteredTasks.length, 10)} of {filteredTasks.length} tasks
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      ← Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                  <div key={status} className="bg-gray-50 rounded-lg border border-gray-200">
                    <div className={`px-4 py-3 border-b-4 ${columnColor} bg-white rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{columnTitle}</h3>
                        <span className="px-2 py-1 text-xs bg-gray-200 rounded-full">{columnTasks.length}</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-3 min-h-[500px]">
                      {columnTasks.map(task => (
                        <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
                            <button className="text-gray-400 hover:text-gray-600">
                              ⋮
                            </button>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <span>Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span>{task.estimatedHours}h</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                {task.assignee.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs text-gray-600">{task.assignee}</span>
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
          
          {/* Task Analytics untuk Supervisor/PM */}
          {currentUser.role !== 'employee' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Analytics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Completion Rate by Department</h4>
                  <div className="space-y-4">
                    {['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'].map(dept => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{dept}</span>
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
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Average Task Duration</h4>
                  <div className="space-y-4">
                    {['High Priority', 'Medium Priority', 'Low Priority'].map(priority => (
                      <div key={priority} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{priority}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {priority === 'High Priority' ? '3.2' : 
                             priority === 'Medium Priority' ? '5.8' : '8.4'} days
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
          {currentUser.role === 'employee' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Task Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Task Statistics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Monthly Completion Rate</span>
                      <span className="text-sm font-medium text-green-600">+12%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">42</div>
                      <div className="text-sm text-gray-600">Tasks Completed</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">4.5</div>
                      <div className="text-sm text-gray-600">Avg. Rating</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Request Task Extension</div>
                      <div className="text-sm text-gray-600 mt-1">Need more time on a task?</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Submit Timesheet</div>
                      <div className="text-sm text-gray-600 mt-1">Log hours for completed tasks</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Bulk Actions untuk Supervisor/PM */}
          {currentUser.role !== 'employee' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Bulk Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Assign Multiple Tasks</div>
                  <div className="text-sm text-gray-600 mt-1">Assign tasks to team members</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Update Deadlines</div>
                  <div className="text-sm text-gray-600 mt-1">Bulk update task deadlines</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Export Task Report</div>
                  <div className="text-sm text-gray-600 mt-1">Generate detailed task report</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}