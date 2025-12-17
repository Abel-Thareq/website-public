"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';

// Data user yang ada di sistem
const availableUsers: User[] = [
  {
    id: "supervisor_001",
    username: "supervisor",
    password: "supervisor123",
    name: "Alex Johnson",
    role: "supervisor",
    initials: "AJ",
    department: "All Departments",
    employeeCount: 124,
    color: "from-purple-500 to-purple-600",
    email: "alex.johnson@techmaven.com",
    joinDate: "2023-01-15"
  },
  {
    id: "pm_001",
    username: "pm",
    password: "pm123",
    name: "Sarah Chen",
    role: "pm",
    initials: "SC",
    department: "Engineering",
    employeeCount: 25,
    color: "from-blue-500 to-blue-600",
    email: "sarah.chen@techmaven.com",
    joinDate: "2023-03-20"
  },
  {
    id: "employee_001",
    username: "john.doe",
    password: "employee123",
    name: "John Doe",
    role: "employee",
    initials: "JD",
    department: "Engineering",
    employeeCount: 1,
    color: "from-green-500 to-green-600",
    email: "john.doe@techmaven.com",
    phone: "+1-555-0123",
    joinDate: "2023-06-10"
  }
];

const tabs = [
  { id: "dashboard", name: "Dashboard", path: "/", icon: "📊" },
  { id: "attendance", name: "Attendance", path: "/attendance", icon: "⏰" },
  { id: "tasks", name: "Tasks", path: "/tasks", icon: "✅" },
  { id: "reports", name: "Reports", path: "/reports", icon: "📈" },
];

export default function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Load user dari localStorage saat komponen mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }

    // Listen untuk openLogin event dari page.tsx
    const handleOpenLogin = () => {
      setIsLoginOpen(true);
    };

    window.addEventListener('openLogin', handleOpenLogin as EventListener);
    
    return () => {
      window.removeEventListener('openLogin', handleOpenLogin as EventListener);
    };
  }, []);

  // Handle login
  const handleLogin = () => {
    setLoginError('');
    
    const user = availableUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword as User);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      // Dispatch event untuk memberitahu page.tsx
      window.dispatchEvent(new CustomEvent('userChange', { detail: userWithoutPassword }));
      
      setIsLoginOpen(false);
      setCredentials({ username: '', password: '' });
      router.refresh(); // Refresh halaman untuk update state
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new CustomEvent('userChange', { detail: null }));
    router.push('/');
    router.refresh(); // Refresh halaman
  };

  // Handle key press untuk login form
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
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
                <p className="text-sm text-gray-500">
                  Employee Monitoring System • {currentUser ? currentUser.role : 'Please Login'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation & User Controls */}
          <div className="flex items-center gap-6">
            {/* Desktop Navigation - hanya tampil jika user login */}
            {currentUser && (
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
            )}

            {/* User Login/Profile */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  {/* Notifications */}
                  <button className="relative p-2 rounded-full hover:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentUser.color} flex items-center justify-center text-white font-bold cursor-pointer`}>
                      {currentUser.initials}
                    </div>
                    
                    <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentUser.color} flex items-center justify-center text-white font-bold`}>
                          {currentUser.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{currentUser.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
                          <p className="text-xs text-gray-400">{currentUser.department}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 border-t border-gray-100 pt-4">
                        <div className="text-xs text-gray-500 px-2">
                          <p>Email: {currentUser.email}</p>
                          <p className="mt-1">Joined: {new Date(currentUser.joinDate).toLocaleDateString()}</p>
                        </div>
                        
                        <button 
                          onClick={() => setIsLoginOpen(true)}
                          className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100"
                        >
                          🔄 Switch Account
                        </button>
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          🔐 Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Login Button */
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation - hanya tampil jika user login */}
        {currentUser && (
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
        )}
      </div>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Login to TechMaven</h2>
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-3">Available Accounts:</p>
                  <div className="space-y-2">
                    {availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setCredentials({
                          username: user.username,
                          password: user.password
                        })}
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${user.color} flex items-center justify-center text-white text-xs font-bold`}>
                          {user.initials}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role} • {user.department}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          Click to fill
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}