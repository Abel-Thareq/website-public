"use client";

import { useState, useEffect, useMemo } from "react";
import NavigationBar from "../components/navigationBar";
import Link from "next/link";
import { User } from "../types/user";
import { AttendanceRecord } from "../types/user";

// Icon Components
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.197v-1a6 6 0 00-4.5-5.803" />
  </svg>
);

export default function AttendancePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");

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

  // Data berdasarkan role
  const attendanceData = useMemo(() => {
    if (!currentUser) return [];

    const baseData: AttendanceRecord[] = [];

    if (currentUser.role === 'supervisor') {
      // Data untuk supervisor (semua departemen)
      for (let i = 0; i < 50; i++) {
        const status = Math.random() > 0.8 ? 'late' : Math.random() > 0.9 ? 'absent' : 'on-time';
        const depts = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
        const dept = depts[Math.floor(Math.random() * depts.length)];
        baseData.push({
          id: i + 1,
          employeeId: `EMP${1000 + i}`,
          employeeName: `Employee ${i + 1}`,
          department: dept,
          date: selectedDate,
          checkIn: status === 'absent' ? '--:--' : `08:${30 + Math.floor(Math.random() * 30)}`,
          checkOut: status === 'absent' ? '--:--' : `17:${30 + Math.floor(Math.random() * 30)}`,
          status: status,
          lateMinutes: status === 'late' ? Math.floor(Math.random() * 60) + 1 : undefined,
          workHours: status === 'absent' ? 0 : 8 + Math.random(),
          notes: status === 'late' ? ['Traffic', 'Transportation', 'Personal', 'Meeting'][Math.floor(Math.random() * 4)] : undefined
        });
      }
    } else if (currentUser.role === 'pm') {
      // Data untuk PM (Engineering department saja)
      for (let i = 0; i < 25; i++) {
        const status = Math.random() > 0.85 ? 'late' : Math.random() > 0.95 ? 'absent' : 'on-time';
        baseData.push({
          id: i + 1,
          employeeId: `ENG${2000 + i}`,
          employeeName: `Engineering Member ${i + 1}`,
          department: 'Engineering',
          date: selectedDate,
          checkIn: status === 'absent' ? '--:--' : `08:${45 + Math.floor(Math.random() * 15)}`,
          checkOut: status === 'absent' ? '--:--' : `17:${30 + Math.floor(Math.random() * 30)}`,
          status: status,
          lateMinutes: status === 'late' ? Math.floor(Math.random() * 30) + 1 : undefined,
          workHours: status === 'absent' ? 0 : 8.5 + Math.random(),
          notes: status === 'late' ? ['Code Review', 'Standup Meeting', 'Client Call'][Math.floor(Math.random() * 3)] : undefined
        });
      }
    } else {
      // Data untuk employee (hanya dirinya sendiri, dengan histori)
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        let status: 'on-time' | 'late' | 'absent' | 'leave';
        if (i === 0) status = 'on-time';
        else if (i === 2 || i === 5) status = 'late';
        else if (i === 10) status = 'absent';
        else status = 'on-time';

        baseData.push({
          id: i + 1,
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          department: currentUser.department,
          date: dateStr,
          checkIn: status === 'absent' ? '--:--' : i % 7 === 0 ? '09:15' : '08:45',
          checkOut: status === 'absent' ? '--:--' : '17:30',
          status: status,
          lateMinutes: status === 'late' ? 30 : undefined,
          workHours: status === 'absent' ? 0 : 8.75,
          notes: status === 'late' ? 'Traffic jam' : status === 'absent' ? 'Sick Leave' : undefined
        });
      }
    }

    return baseData;
  }, [currentUser, selectedDate]);

  // Filter data berdasarkan department
  const filteredData = useMemo(() => {
    if (selectedDepartment === "all") return attendanceData;
    return attendanceData.filter(record => record.department === selectedDepartment);
  }, [attendanceData, selectedDepartment]);

  // Hitung statistik
  const stats = useMemo(() => {
    const total = filteredData.length;
    const onTime = filteredData.filter(r => r.status === 'on-time').length;
    const late = filteredData.filter(r => r.status === 'late').length;
    const absent = filteredData.filter(r => r.status === 'absent').length;
    const averageWorkHours = filteredData.length > 0 
      ? (filteredData.reduce((sum, r) => sum + r.workHours, 0) / filteredData.length).toFixed(1)
      : '0.0';

    return { total, onTime, late, absent, averageWorkHours };
  }, [filteredData]);

  // Data untuk chart (harian)
  const dailyChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      onTime: Math.floor(Math.random() * 20) + 80,
      late: Math.floor(Math.random() * 10) + 5,
      absent: Math.floor(Math.random() * 5)
    }));
  }, []);

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
            <h2 className="text-2xl font-bold text-gray-900">Please login to view attendance</h2>
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
            {currentUser.role === 'employee' ? 'My ' : ''}Attendance <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            {currentUser.role === 'supervisor' 
              ? 'Real-time tracking and monitoring of all employee attendance records'
              : currentUser.role === 'pm'
              ? `Track ${currentUser.department} department attendance records`
              : 'Track your personal attendance history and records'}
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
                        <span className="text-gray-900 font-medium">Attendance</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentUser.role === 'supervisor' 
                    ? 'Company Attendance Dashboard'
                    : currentUser.role === 'pm'
                    ? `${currentUser.department} Department Attendance`
                    : 'My Attendance History'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentUser.role === 'supervisor' 
                    ? 'Monitor attendance across all departments'
                    : currentUser.role === 'pm'
                    ? 'Track team member attendance and punctuality'
                    : 'View your complete attendance record'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/"
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  ← Back to Dashboard
                </Link>
                
                {currentUser.role !== 'employee' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total {currentUser.role === 'employee' ? 'Days' : 'Employees'}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <UserGroupIcon />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'employee' 
                    ? 'Total working days tracked'
                    : `${currentUser.role === 'pm' ? 'Team members' : 'Employees'} today`}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Time</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.onTime}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.onTime / stats.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? `${((stats.onTime / stats.total) * 100).toFixed(1)}% on-time rate` : 'No data'}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Late Arrivals</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.late}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <ClockIcon />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Average: {stats.late > 0 ? '15 mins' : '0 mins'} late
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Work Hours</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.averageWorkHours}h</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'employee' ? 'Your average' : 'Department average'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Filters dan Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                <p className="text-sm text-gray-600 mt-1">Filter and manage attendance data</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <CalendarIcon />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Department Filter (hanya untuk supervisor) */}
                {currentUser.role === 'supervisor' && (
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept === 'All Departments' ? 'all' : dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                )}
                
                {/* Time Range */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {(['today', 'week', 'month'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        timeRange === range 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detailed Records</h3>
                  <p className="text-sm text-gray-600">
                    {currentUser.role === 'employee' 
                      ? 'Your complete attendance history'
                      : `Showing ${filteredData.length} ${currentUser.role === 'pm' ? 'team members' : 'employees'}`}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: Today, 10:45 AM
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {currentUser.role !== 'employee' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {currentUser.role === 'employee' ? 'Date' : 'Employee'}
                    </th>
                    {currentUser.role !== 'employee' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                    {currentUser.role !== 'employee' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      {currentUser.role !== 'employee' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.employeeId}</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {currentUser.role === 'employee' 
                              ? new Date(record.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              : record.employeeName}
                          </div>
                          {currentUser.role === 'employee' && (
                            <div className="text-sm text-gray-500">{record.date}</div>
                          )}
                        </div>
                      </td>
                      {currentUser.role !== 'employee' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {record.department}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <ClockIcon />
                          {record.checkIn}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <ClockIcon />
                          {record.checkOut}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          record.status === 'on-time' 
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'on-time' ? 'On Time' : 
                           record.status === 'late' ? `Late (${record.lateMinutes}m)` : 
                           'Absent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.workHours.toFixed(1)} hours
                      </td>
                      {currentUser.role !== 'employee' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.notes || '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Details
                        </button>
                        {currentUser.role !== 'employee' && record.status === 'late' && (
                          <button className="text-amber-600 hover:text-amber-900">
                            Send Reminder
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(filteredData.length, 10)} of {filteredData.length} records
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
          
          {/* Chart Section */}
          {currentUser.role !== 'employee' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Trends</h3>
                  <p className="text-sm text-gray-600">Weekly attendance overview</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              
              <div className="h-64 flex items-end gap-4">
                {dailyChartData.map((day, index) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-2">{day.day}</div>
                    <div className="w-full flex flex-col-reverse h-48 gap-1">
                      <div 
                        className="bg-green-500 rounded-t"
                        style={{ height: `${day.onTime}%` }}
                        title={`On Time: ${day.onTime}%`}
                      />
                      <div 
                        className="bg-amber-500 rounded-t"
                        style={{ height: `${day.late}%` }}
                        title={`Late: ${day.late}%`}
                      />
                      <div 
                        className="bg-red-500 rounded-t"
                        style={{ height: `${day.absent}%` }}
                        title={`Absent: ${day.absent}%`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">On Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span className="text-sm text-gray-600">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Employee-specific content */}
          {currentUser.role === 'employee' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Working Days</span>
                    <span className="font-semibold">22</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">On Time Days</span>
                    <span className="font-semibold text-green-600">20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Late Days</span>
                    <span className="font-semibold text-amber-600">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Absent Days</span>
                    <span className="font-semibold text-red-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Work Hours</span>
                    <span className="font-semibold">176.5h</span>
                  </div>
                </div>
              </div>
              
              {/* Request Time Off */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Request Time Off</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Sick Leave</option>
                      <option>Annual Leave</option>
                      <option>Personal Leave</option>
                      <option>Emergency Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dates</label>
                    <div className="flex gap-2">
                      <input type="date" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                      <span className="self-center">to</span>
                      <input type="date" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                      rows={3}
                      placeholder="Brief reason for your leave request..."
                    />
                  </div>
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Actions untuk Supervisor/PM */}
          {currentUser.role !== 'employee' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Send Attendance Report</div>
                  <div className="text-sm text-gray-600 mt-1">Generate and send weekly report</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Add Attendance Exception</div>
                  <div className="text-sm text-gray-600 mt-1">Add manual attendance record</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Set Reminders</div>
                  <div className="text-sm text-gray-600 mt-1">Configure attendance reminders</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}