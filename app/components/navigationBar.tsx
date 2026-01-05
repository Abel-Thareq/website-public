"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useUser } from '../providers/userProvider';
import PendingRegistrationModal from './pendingRegistrationModal';
import { pendingRegistrationApi } from '../../lib/api';

// Types
interface User {
  id: string;
  username: string;
  password?: string; // Hanya untuk development
  name: string;
  role: 'supervisor' | 'pm' | 'employee';
  initials: string;
  department: string;
  employeeCount: number;
  color: string;
  email: string;
  phone?: string;
  joinDate: string;
}

interface Theme {
  isDayTime: boolean;
  backgroundImage: string;
  theme: 'light' | 'dark';
}

const tabs = [
  { id: "dashboard", name: "Dashboard", path: "/dashboard", icon: "📊" },
  { id: "attendance", name: "Attendance", path: "/attendance", icon: "⏰" },
  { id: "tasks", name: "Tasks", path: "/tasks", icon: "✅" },
  { id: "reports", name: "Reports", path: "/reports", icon: "📈" },
];

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

export default function NavigationBar() {
  const { login, logout } = useUser();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSwitchAccountMode, setIsSwitchAccountMode] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isPendingRegModalOpen, setIsPendingRegModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Theme state
  const [theme, setTheme] = useState<Theme>({
    isDayTime: true,
    backgroundImage: "/backgroundDay.jpg",
    theme: 'light'
  });

  // Load theme dari localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setTheme({
          ...parsedTheme,
          theme: parsedTheme.theme as 'light' | 'dark'
        });
      } catch (error) {
        console.error('Error parsing theme:', error);
      }
    }

    // Listen untuk theme changes
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          setTheme({
            ...parsedTheme,
            theme: parsedTheme.theme as 'light' | 'dark'
          });
        } catch (error) {
          console.error('Error parsing theme:', error);
        }
      }
    };

    // Check for theme changes periodically
    const themeCheckInterval = setInterval(handleThemeChange, 100);

    return () => clearInterval(themeCheckInterval);
  }, []);

  // Load user dari sessionStorage/localStorage saat komponen mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
      }
    }

    // Listen untuk openLogin event dari page.tsx
    const handleOpenLogin = () => {
      setIsLoginOpen(true);
      setIsSwitchAccountMode(false);
    };

    // Listen untuk userChange event
    const handleUserChange = (event: CustomEvent) => {
      if (event.detail === null) {
        setCurrentUser(null);
      } else {
        setCurrentUser(event.detail);
      }
    };

    window.addEventListener('openLogin', handleOpenLogin as EventListener);
    window.addEventListener('userChange', handleUserChange as EventListener);
    
    return () => {
      window.removeEventListener('openLogin', handleOpenLogin as EventListener);
      window.removeEventListener('userChange', handleUserChange as EventListener);
    };
  }, []);

  // Fetch pending count for supervisor
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'supervisor') return;

    const fetchPendingCount = async () => {
      try {
        const data = await pendingRegistrationApi.getPendingCount();
        setPendingCount(data.count || 0);
      } catch (err) {
        console.error('Failed to fetch pending count:', err);
        setPendingCount(0);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Theme colors based on current theme
  const themeColors = theme.isDayTime ? {
    navBg: "bg-white",
    navBorder: "border-gray-200",
    text: "text-gray-900",
    textLight: "text-gray-500",
    textHover: "hover:text-gray-900",
    tabInactive: "text-gray-600",
    tabActive: "bg-blue-100 text-blue-700",
    tabHover: "hover:bg-gray-100",
    buttonHover: "hover:bg-gray-100",
    dropdownBg: "bg-white",
    dropdownBorder: "border-gray-200",
    dropdownShadow: "shadow-lg",
    inputBg: "bg-white",
    inputBorder: "border-gray-300",
    mobileBg: "bg-gray-50",
    notificationDot: "bg-red-500"
  } : {
    navBg: "bg-gray-900",
    navBorder: "border-gray-800",
    text: "text-gray-100",
    textLight: "text-gray-400",
    textHover: "hover:text-gray-100",
    tabInactive: "text-gray-400",
    tabActive: "bg-blue-900/50 text-blue-300",
    tabHover: "hover:bg-gray-800",
    buttonHover: "hover:bg-gray-800",
    dropdownBg: "bg-gray-800",
    dropdownBorder: "border-gray-700",
    dropdownShadow: "shadow-xl shadow-black/50",
    inputBg: "bg-gray-900",
    inputBorder: "border-gray-700",
    mobileBg: "bg-gray-800",
    notificationDot: "bg-red-500"
  };

  // Handle login dari landing page (redirect ke dashboard) - VERSI YANG DIPERBAIKI
  const handleLoginFromLanding = async () => {
    setLoginError('');
    setIsSwitchingAccount(true);
    
    try {
      const success = await login(credentials.username, credentials.password);
      
      if (success) {
        setIsLoginOpen(false);
        setCredentials({ username: '', password: '' });
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } else {
        setLoginError('Invalid username or password');
        setIsSwitchingAccount(false);
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.message || 'Login failed');
      setIsSwitchingAccount(false);
    }
  };

  // Handle login fallback untuk development (tanpa API)
  const handleLoginFromLandingFallback = () => {
    setLoginError('');
    setIsLoggingIn(true);
    
    // Simulasi delay API
    setTimeout(() => {
      const user = availableUsers.find(
        u => u.username === credentials.username && u.password === credentials.password
      );
      
      if (user) {
        const { password, ...userWithoutPassword } = user;
        
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        setCurrentUser(userWithoutPassword);
        setIsLoginOpen(false);
        setCredentials({ username: '', password: '' });
        window.dispatchEvent(new CustomEvent('userChange', { detail: userWithoutPassword }));
        setIsLoggingIn(false);
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } else {
        setLoginError('Invalid username or password');
        setIsLoggingIn(false);
      }
    }, 500);
  };

  // Handle switch account
  const handleSwitchToUser = (user: User) => {
    const { password, ...userWithoutPassword } = user;
    
    setIsSwitchingAccount(true);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    setIsLoginOpen(false);
    setIsSwitchAccountMode(false);
    setCurrentUser(userWithoutPassword);
    window.dispatchEvent(new CustomEvent('userChange', { detail: userWithoutPassword }));
    
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 100);
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Let userProvider handle all logout logic including clearing storage and redirecting
    await logout();
  };

  // Handle switch account
  const handleOpenSwitchAccount = () => {
    setIsSwitchAccountMode(true);
    setIsLoginOpen(true);
    setLoginError('');
    setCredentials({ username: '', password: '' });
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Cek apakah API_URL ada untuk menentukan mode
      if (process.env.NEXT_PUBLIC_API_URL) {
        handleLoginFromLanding();
      } else {
        handleLoginFromLandingFallback();
      }
    }
  };

  // Handle quick login
  const handleQuickLogin = (user: User) => {
    setCredentials({
      username: user.username,
      password: user.password || ''
    });
    
    setTimeout(() => {
      // Cek apakah API_URL ada untuk menentukan mode
      if (process.env.NEXT_PUBLIC_API_URL) {
        handleLoginFromLanding();
      } else {
        handleLoginFromLandingFallback();
      }
    }, 200);
  };

  return (
    <div className={`${themeColors.navBg} shadow-sm border-b ${themeColors.navBorder} sticky top-0 z-40 transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Logo & Title */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center ${theme.isDayTime ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
                <Image
                  src="/TechMaven.png"
                  alt="TechMaven Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${themeColors.text}`}>TechMedia TechMaven Portal</h1>
                <p className={`text-sm ${themeColors.textLight}`}>
                  Employee Monitoring System • {currentUser ? currentUser.role : 'Please Login'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation & User Controls */}
          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
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
                          ? themeColors.tabActive
                          : `${themeColors.tabInactive} ${themeColors.tabHover}`
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
                  {/* Notifications - Bell for Supervisor */}
                  {currentUser.role === 'supervisor' && (
                    <button 
                      onClick={() => setIsPendingRegModalOpen(true)}
                      className={`relative p-2 rounded-full ${themeColors.buttonHover} transition-colors cursor-pointer`}
                      title="Pending Registrations"
                    >
                      <svg className={`w-5 h-5 ${themeColors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {pendingCount > 0 && (
                        <span className={`absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse leading-none`}>
                          {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentUser.color} flex items-center justify-center text-white font-bold cursor-pointer`}>
                      {currentUser.initials}
                    </div>
                    
                    <div className={`absolute right-0 top-full mt-2 w-64 p-4 ${themeColors.dropdownBg} rounded-xl ${themeColors.dropdownShadow} border ${themeColors.dropdownBorder} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentUser.color} flex items-center justify-center text-white font-bold`}>
                          {currentUser.initials}
                        </div>
                        <div>
                          <p className={`font-semibold ${themeColors.text}`}>{currentUser.name}</p>
                          <p className={`text-sm ${themeColors.textLight} capitalize`}>{currentUser.role}</p>
                          <p className={`text-xs ${themeColors.textLight}`}>{currentUser.department}</p>
                        </div>
                      </div>
                      
                      <div className={`space-y-3 border-t ${themeColors.dropdownBorder} pt-4`}>
                        <div className={`text-xs ${themeColors.textLight} px-2`}>
                          <p>Email: {currentUser.email}</p>
                          <p className="mt-1">Joined: {new Date(currentUser.joinDate).toLocaleDateString()}</p>
                        </div>
                        
                        <button 
                          onClick={handleOpenSwitchAccount}
                          disabled={isSwitchingAccount}
                          className={`w-full text-left px-3 py-2 text-sm text-blue-600 ${theme.isDayTime ? 'hover:bg-blue-50 border-blue-100' : 'hover:bg-blue-900/30 border-blue-800'} rounded-lg border flex items-center gap-2 disabled:opacity-50 transition-colors`}
                        >
                          {isSwitchingAccount ? (
                            <>
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Switching...
                            </>
                          ) : (
                            <>
                              🔄 Switch Account
                            </>
                          )}
                        </button>
                        
                        <button 
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className={`w-full text-left px-3 py-2 text-sm text-red-600 ${theme.isDayTime ? 'hover:bg-red-50' : 'hover:bg-red-900/30'} rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors`}
                        >
                          {isLoggingOut ? (
                            <>
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              Logging out...
                            </>
                          ) : (
                            <>
                              🔐 Logout
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsSwitchAccountMode(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {currentUser && (
          <div className="md:hidden mt-4">
            <div className={`flex justify-around ${themeColors.mobileBg} rounded-lg p-1 overflow-x-auto`}>
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    className={`flex flex-col items-center justify-center px-3 py-2 rounded-md text-sm transition-all ${
                      isActive
                        ? `${theme.isDayTime ? 'bg-white text-blue-600 shadow-sm' : 'bg-gray-700 text-blue-400'}`
                        : themeColors.tabInactive
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
          <div className={`${themeColors.dropdownBg} rounded-xl shadow-xl w-full max-w-md`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${themeColors.text}`}>
                    {isSwitchAccountMode ? 'Switch Account' : 'Login to TechMaven'}
                  </h2>
                  <p className={`text-sm ${themeColors.textLight} mt-1`}>
                    {isSwitchAccountMode 
                      ? 'Select an account to switch to' 
                      : 'Enter your credentials or select quick login'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsLoginOpen(false);
                    setIsSwitchAccountMode(false);
                    setLoginError('');
                    setCredentials({ username: '', password: '' });
                  }}
                  className={`p-2 ${themeColors.buttonHover} rounded-full transition-colors`}
                >
                  ✕
                </button>
              </div>

              {isSwitchAccountMode ? (
                <div className="space-y-3">
                  <div className={`text-sm ${themeColors.textLight} mb-4 p-3 ${theme.isDayTime ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/30 border-blue-800'} rounded-lg border`}>
                    <p className={`font-medium ${theme.isDayTime ? 'text-blue-900' : 'text-blue-300'}`}>👤 Select Account</p>
                    <p className={`text-xs ${theme.isDayTime ? 'text-blue-700' : 'text-blue-400'} mt-1`}>Click on any account to switch instantly</p>
                  </div>
                  
                  {availableUsers
                    .filter(user => user.id !== currentUser?.id)
                    .map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-4 p-4 border-2 ${themeColors.inputBorder} rounded-xl ${theme.isDayTime ? 'hover:border-blue-400 hover:bg-blue-50' : 'hover:border-blue-600 hover:bg-blue-900/20'} cursor-pointer transition-all group`}
                        onClick={() => handleSwitchToUser(user)}
                      >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${user.color} flex items-center justify-center text-white text-lg font-bold flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          {user.initials}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${themeColors.text} ${theme.isDayTime ? 'group-hover:text-blue-700' : 'group-hover:text-blue-400'}`}>{user.name}</p>
                          <p className={`text-sm ${themeColors.textLight} capitalize`}>{user.role}</p>
                          <p className={`text-xs ${themeColors.textLight}`}>{user.department}</p>
                        </div>
                        <div className="text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Switch →
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {loginError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium ${themeColors.text} mb-1`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-4 py-2 border ${themeColors.inputBorder} ${themeColors.inputBg} ${themeColors.text} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeColors.text} mb-1`}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-4 py-2 border ${themeColors.inputBorder} ${themeColors.inputBg} ${themeColors.text} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter password"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (process.env.NEXT_PUBLIC_API_URL) {
                        handleLoginFromLanding();
                      } else {
                        handleLoginFromLandingFallback();
                      }
                    }}
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>

                  <div className={`border-t ${themeColors.dropdownBorder} pt-4`}>
                    <p className={`text-sm ${themeColors.textLight} mb-3`}>Quick Login - Click to select:</p>
                    <div className="space-y-2">
                      {availableUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 p-3 border ${themeColors.inputBorder} rounded-lg ${theme.isDayTime ? 'hover:bg-blue-50 hover:border-blue-300' : 'hover:bg-blue-900/20 hover:border-blue-700'} cursor-pointer transition-all`}
                          onClick={() => handleQuickLogin(user)}
                        >
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${user.color} flex items-center justify-center text-white text-xs font-bold`}>
                            {user.initials}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${themeColors.text}`}>{user.name}</p>
                            <p className={`text-xs ${themeColors.textLight} capitalize`}>{user.role} • {user.department}</p>
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Click to login
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(isLoggingOut || isSwitchingAccount) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-900 font-medium">
              {isLoggingOut ? 'Logging out...' : 'Switching account...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Please wait</p>
          </div>
        </div>
      )}

      {/* Pending Registration Modal */}
      {currentUser?.role === 'supervisor' && (
        <PendingRegistrationModal
          isOpen={isPendingRegModalOpen}
          onClose={() => setIsPendingRegModalOpen(false)}
          onRefresh={() => {
            if (currentUser?.role === 'supervisor') {
              pendingRegistrationApi.getPendingCount().then(data => {
                setPendingCount(data.count || 0);
              }).catch(err => {
                console.error('Failed to refresh pending count:', err);
              });
            }
          }}
          theme={theme}
        />
      )}
    </div>
  );
}