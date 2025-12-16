"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function NavigationBar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'supervisor' | 'pm' | 'employee'>('supervisor');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Data user berdasarkan role
  const users = {
    supervisor: {
      id: "supervisor",
      name: "Supervisor",
      role: "Supervisor",
      initials: "SV",
      department: "All Departments",
      employeeCount: 124,
      color: "from-purple-500 to-purple-600"
    },
    pm: {
      id: "pm",
      name: "Sarah Chen",
      role: "Project Manager",
      initials: "SC",
      department: "Engineering",
      employeeCount: 25,
      color: "from-blue-500 to-blue-600"
    },
    employee: {
      id: "employee",
      name: "John Doe",
      role: "Frontend Engineer",
      initials: "JD",
      department: "Engineering",
      employeeCount: 1,
      color: "from-green-500 to-green-600"
    }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard", path: "/", icon: "📊" },
    { id: "attendance", name: "Attendance", path: "/attendance", icon: "⏰" },
    { id: "tasks", name: "Tasks", path: "/tasks", icon: "✅" },
    { id: "reports", name: "Reports", path: "/reports", icon: "📈" },
  ];

  // Load role dari localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as 'supervisor' | 'pm' | 'employee';
    if (savedRole) {
      setUserRole(savedRole);
      setCurrentUser(users[savedRole]);
    } else {
      setCurrentUser(users.supervisor);
    }
  }, []);

  // Handle role change
  const changeRole = (role: 'supervisor' | 'pm' | 'employee') => {
    setUserRole(role);
    setCurrentUser(users[role]);
    localStorage.setItem('userRole', role);
    // Trigger custom event untuk memberitahu page.tsx
    window.dispatchEvent(new CustomEvent('roleChange', { detail: role }));
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Logo & Title */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200">
                <Image
                  src="/TechMaven.png"
                  alt="TechMaven Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TechMedia TechMaven Portal</h1>
                <p className="text-sm text-gray-500">Employee Monitoring System • {currentUser?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation & User Controls */}
          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2 text-sm">
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Role Selector & Profile */}
            <div className="flex items-center gap-3">
              {/* Role Selector Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  <span className={`w-2 h-2 rounded-full ${
                    userRole === 'supervisor' ? 'bg-purple-500' :
                    userRole === 'pm' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></span>
                  <span className="font-medium">{currentUser?.role}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500">Switch Role</p>
                  </div>
                  
                  <button
                    onClick={() => changeRole('supervisor')}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-gray-50 ${
                      userRole === 'supervisor' ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">SV</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Supervisor</div>
                      <div className="text-xs text-gray-500">Monitor all departments</div>
                    </div>
                    {userRole === 'supervisor' && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => changeRole('pm')}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-gray-50 ${
                      userRole === 'pm' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">PM</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Project Manager</div>
                      <div className="text-xs text-gray-500">Single department view</div>
                    </div>
                    {userRole === 'pm' && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => changeRole('employee')}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-gray-50 ${
                      userRole === 'employee' ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">E</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Employee</div>
                      <div className="text-xs text-gray-500">Personal dashboard</div>
                    </div>
                    {userRole === 'employee' && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar */}
              <div className="relative group">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentUser?.color} flex items-center justify-center text-white font-bold cursor-pointer`}>
                  {currentUser?.initials}
                </div>
                
                <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentUser?.color} flex items-center justify-center text-white font-bold`}>
                      {currentUser?.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{currentUser?.name}</p>
                      <p className="text-sm text-gray-500">{currentUser?.role}</p>
                      <p className="text-xs text-gray-400">{currentUser?.department}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      👤 My Profile
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      ⚙️ Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      🔐 Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4">
          <div className="flex justify-around bg-gray-50 rounded-lg p-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-md text-sm transition-all ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span className="text-xs">{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}