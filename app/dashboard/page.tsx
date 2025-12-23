"use client";
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import NavigationBar from "../components/navigationBar";
import { User } from "../types/user";
import { useRouter } from "next/navigation";
import { attendanceApi, tasksApi, usersApi, teamApi, workHoursApi } from "../../lib/api";
import { useUser } from "../providers/userProvider";
import { useTheme } from "../providers/temaProvider";

interface TiltState {
  tiltX: number;
  tiltY: number;
  isHovering: boolean;
}

interface Theme {
  isDayTime: boolean;
  backgroundImage: string;
  theme: 'light' | 'dark';
}

// Memoized Icon Components
const UsersIcon = memo(() => (
  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.197v-1a6 6 0 00-4.5-5.803" />
  </svg>
));

const CheckCircleIcon = memo(() => (
  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));

const ClockIcon = memo(() => (
  <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));

const BriefcaseIcon = memo(() => (
  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
));

const TrophyIcon = memo(() => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
));

const BarChartIcon = memo(() => (
  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
));

const CalendarIcon = memo(() => (
  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
));

const UserIcon = memo(() => (
  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
));

const ChevronRightIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
));

const SunIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
));

const MoonIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
));

// Memoized Theme Toggle Component
const ThemeToggle = memo(({ 
  theme, 
  toggleTheme, 
  setDayMode, 
  setNightMode,
  currentUser,
  onLogout
}: { 
  theme: Theme;
  toggleTheme: () => void;
  setDayMode: () => void;
  setNightMode: () => void;
  currentUser: User | null;
  onLogout: () => void;
}) => (
  <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
    {/* Logout Button */}
    {currentUser && (
      <button
        onClick={onLogout}
        className="px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium backdrop-blur-sm"
      >
        Logout {currentUser.name.split(' ')[0]}
      </button>
    )}
    
    <div className="relative group">
      <div 
        className={`px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2 cursor-pointer transition-all duration-300 ${
          theme.isDayTime
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-black/30 text-white hover:bg-black/40"
        }`}
        onClick={toggleTheme}
      >
        <div className={`w-2 h-2 rounded-full ${theme.isDayTime ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
        <span className="text-sm font-medium">
          {theme.isDayTime ? '☀️ Day Mode' : '🌙 Night Mode'}
        </span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${theme.isDayTime ? 'text-yellow-300' : 'text-blue-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <div className={`absolute right-0 top-full mt-2 w-48 py-2 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 ${
        theme.isDayTime 
          ? 'bg-white/90 text-gray-800' 
          : 'bg-gray-900/90 text-white'
      }`}>
        <div className="px-3 py-1 text-xs font-medium opacity-70 mb-1">
          Choose Theme
        </div>
        <button
          onClick={setDayMode}
          className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
            theme.isDayTime 
              ? 'bg-yellow-50/70 text-yellow-800' 
              : 'hover:bg-white/10'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
            <SunIcon />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">Day Mode</div>
            <div className="text-xs opacity-70">Bright and vibrant</div>
          </div>
          {theme.isDayTime && (
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          )}
        </button>
        
        <button
          onClick={setNightMode}
          className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
            !theme.isDayTime 
              ? 'bg-blue-900/70 text-blue-100' 
              : 'hover:bg-white/10'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <MoonIcon />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">Night Mode</div>
            <div className="text-xs opacity-70">Dark and calm</div>
          </div>
          {!theme.isDayTime && (
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          )}
        </button>
      </div>
    </div>
  </div>
));

// Memoized Custom Cursor Component
const CustomCursor = memo(({ 
  isMobile, 
  cursorPosition, 
  isPointer, 
  isOverText, 
  theme 
}: { 
  isMobile: boolean;
  cursorPosition: { x: number; y: number };
  isPointer: boolean;
  isOverText: boolean;
  theme: Theme;
}) => {
  if (isMobile) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-75 ease-out"
      style={{
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={`absolute rounded-full transition-all duration-200 ease-out ${
          isPointer ? "scale-125" : "scale-100"
        } ${isOverText ? "bg-transparent" : theme.isDayTime ? "bg-blue-600/20" : "bg-blue-400/30"}`}
        style={{
          width: isPointer ? "24px" : "20px",
          height: isPointer ? "24px" : "20px",
          border: isOverText
            ? theme.isDayTime
              ? "2px solid rgba(59, 130, 246, 0.5)"
              : "2px solid rgba(96, 165, 250, 0.5)"
            : "none",
          boxShadow: isOverText ? "0 0 0 1px rgba(255, 255, 255, 0.5) inset" : "none",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "4px",
          height: "4px",
          backgroundColor: theme.isDayTime ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.95)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: theme.isDayTime ? "0 0 6px rgba(255, 255, 255, 0.8)" : "0 0 6px rgba(255, 255, 255, 0.9)",
          display: isPointer ? "none" : "block",
        }}
      />
    </div>
  );
});

// Memoized Stat Card Component
const StatCard = memo(({
  cardId,
  title,
  value,
  icon: Icon,
  color,
  subText,
  progress,
  additionalContent,
  tiltState,
  themeColors
}: {
  cardId: string;
  title: string;
  value: string | number;
  icon: React.ComponentType;
  color: string;
  subText?: string;
  progress?: number;
  additionalContent?: React.ReactNode;
  tiltState: TiltState;
  themeColors: any;
}) => (
  <div
    data-card={cardId}
    className={`${themeColors.cardBg} rounded-xl p-6 ${themeColors.shadow} border ${themeColors.border} transform-gpu transition-all duration-300 ease-out`}
    style={{
      transform: tiltState.isHovering
        ? `perspective(1000px) rotateX(${tiltState.tiltX}deg) rotateY(${tiltState.tiltY}deg) translateZ(20px) scale(1.02)`
        : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
      boxShadow: tiltState.isHovering
        ? themeColors.shadowHover || "0 20px 40px rgba(0,0,0,0.1)"
        : themeColors.shadow,
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm ${themeColors.textLight} font-medium`}>{title}</p>
        <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
        {subText && <p className={`text-xs ${themeColors.textLighter} mt-1`}>{subText}</p>}
      </div>
      <div className={`p-3 rounded-lg ${themeColors.iconBg}`}>
        <Icon />
      </div>
    </div>
    {additionalContent}
  </div>
));

// Personal Dashboard Component untuk Employee Role
const PersonalDashboard = memo(({ 
  themeColors, 
  personalData,
  theme,
  currentUser
}: { 
  themeColors: any;
  personalData: any;
  theme: Theme;
  currentUser: User;
}) => (
  <div className="space-y-8">
    {/* Welcome Section */}
    <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-8 text-center`}>
      <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-blue-100 overflow-hidden bg-gradient-to-br from-blue-100 to-white flex items-center justify-center">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentUser.color} flex items-center justify-center text-white text-2xl font-bold`}>
          {currentUser.initials}
        </div>
      </div>
      <h2 className={`text-2xl font-bold ${themeColors.text} mb-2`}>Welcome back, {currentUser.name}!</h2>
      <p className={`${themeColors.textLight} mb-6`}>{currentUser.role === 'employee' ? 'Frontend Engineer' : currentUser.role} • {currentUser.department} Department</p>
      
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className={`p-4 rounded-lg ${themeColors.bgLight} border ${themeColors.border}`}>
          <p className={`text-sm ${themeColors.textLight}`}>Today's Status</p>
          <p className={`text-xl font-bold ${theme.isDayTime ? 'text-green-600' : 'text-green-400'} mt-2`}>On Time</p>
        </div>
        <div className={`p-4 rounded-lg ${themeColors.bgLight} border ${themeColors.border}`}>
          <p className={`text-sm ${themeColors.textLight}`}>Clock In</p>
          <p className={`text-xl font-bold ${themeColors.text} mt-2`}>08:45 AM</p>
        </div>
        <div className={`p-4 rounded-lg ${themeColors.bgLight} border ${themeColors.border}`}>
          <p className={`text-sm ${themeColors.textLight}`}>Total Hours</p>
          <p className={`text-xl font-bold ${themeColors.text} mt-2`}>8.75 hrs</p>
        </div>
      </div>
    </div>

    {/* Personal Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm ${themeColors.textLight} font-medium`}>Performance Rating</p>
          <div className={`p-2 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </div>
        <p className={`text-3xl font-bold ${themeColors.text}`}>4.5<span className="text-xl">/5.0</span></p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div>
          </div>
          <span className="text-sm text-green-600">Excellent</span>
        </div>
      </div>

      <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm ${themeColors.textLight} font-medium`}>Tasks Completed</p>
          <div className={`p-2 ${theme.isDayTime ? 'bg-green-50' : 'bg-green-900/20'} rounded-lg`}>
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className={`text-3xl font-bold ${themeColors.text}`}>42</p>
        <p className={`text-sm ${themeColors.textLight} mt-2`}>This month</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-green-600">+15% from last month</span>
        </div>
      </div>

      <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm ${themeColors.textLight} font-medium`}>On Time Rate</p>
          <div className={`p-2 ${theme.isDayTime ? 'bg-green-50' : 'bg-green-900/20'} rounded-lg`}>
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className={`text-3xl font-bold ${themeColors.text}`}>95%</p>
        <p className={`text-sm ${themeColors.textLight} mt-2`}>Attendance accuracy</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
        </div>
      </div>
    </div>

    {/* My Tasks */}
    <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} overflow-hidden`}>
      <div className={`px-6 py-4 border-b ${themeColors.border} bg-gradient-to-r ${themeColors.gradientFrom} ${themeColors.gradientTo}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${themeColors.text} flex items-center gap-2`}>
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              My Tasks
            </h3>
            <p className={`text-sm ${themeColors.textLight} mt-1`}>Your current assignments</p>
          </div>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + New Task
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {personalData.personalTasks.map((task: any) => (
          <div key={task.id} className="px-6 py-4 hover:bg-blue-50/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  task.status === 'Completed' ? 'bg-green-100' :
                  task.status === 'In Progress' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  {task.status === 'Completed' ? '✅' : task.status === 'In Progress' ? '⚡' : '⏳'}
                </div>
                <div>
                  <p className={`font-medium ${themeColors.text}`}>{task.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`text-sm ${themeColors.textLighter}`}>Due: {task.deadline}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${themeColors.textLighter}`}>Progress:</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                  </div>
                  <span className="text-xs font-medium">{task.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

// Memoized Footer Component dengan currentUser
const Footer = memo(({ themeColors, theme, currentUser }: { themeColors: any, theme: Theme, currentUser: User | null }) => (
  <div className={`mt-16 border-t ${themeColors.border} ${themeColors.bg}`}>
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <Image
                src="/TechMaven.png"
                alt="TechMaven Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <p className={`text-lg font-bold ${themeColors.text}`}>TechMaven Portal</p>
              <p className={`text-xs ${themeColors.textLighter}`}>
                v2.1.4 • {currentUser ? 
                  `${currentUser.role === 'supervisor' ? 'Supervisor View' : 
                    currentUser.role === 'pm' ? 'Project Manager View' : 'Employee View'}` 
                  : 'Login Required'}
              </p>
            </div>
          </div>
          <p className={`text-sm ${themeColors.textLight}`}>
            {currentUser 
              ? currentUser.role === 'supervisor' 
                ? 'Advanced company-wide monitoring and performance management system.' :
                currentUser.role === 'pm'
                ? 'Team management and performance tracking system for project managers.' :
                'Personal performance and task management dashboard.'
              : 'Employee Monitoring & Performance Management System.'}
          </p>
        </div>
       
        <div>
          <h4 className={`font-semibold ${themeColors.text} mb-4`}>Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/attendance" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>
              {currentUser?.role === 'employee' ? 'My Attendance' : 'Attendance'}
            </Link></li>
            <li><Link href="/tasks" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>
              {currentUser?.role === 'employee' ? 'My Tasks' : 'Task Management'}
            </Link></li>
            {currentUser && currentUser.role !== 'employee' && (
              <li><Link href="/reports" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Reports</Link></li>
            )}
            <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Performance Reviews</a></li>
          </ul>
        </div>
       
        <div>
          <h4 className={`font-semibold ${themeColors.text} mb-4`}>Resources</h4>
          <ul className="space-y-2">
            <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Help Center</a></li>
            <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Documentation</a></li>
            {currentUser && currentUser.role !== 'employee' && (
              <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Team Analytics</a></li>
            )}
            <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>System Status</a></li>
          </ul>
        </div>
       
        <div>
          <h4 className={`font-semibold ${themeColors.text} mb-4`}>Legal</h4>
          <ul className="space-y-2">
            <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Privacy Policy</a></li>
            <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Terms of Service</a></li>
            <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Employee Handbook</a></li>
            <li><a href="#" className={`text-sm ${themeColors.textLight} hover:text-blue-600`}>Contact HR</a></li>
          </ul>
        </div>
      </div>
     
      <div className={`mt-12 pt-8 border-t ${themeColors.borderLight}`}>
        <div className="flex flex-col md:flexRow justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className={`text-sm ${themeColors.textLight}`}>
              © 2025 TechMedia Corporation. All rights reserved.
            </p>
            <p className={`text-xs ${themeColors.textLighter} mt-1`}>
              Employee Monitoring & Performance Management System • {currentUser ? 
                `${currentUser.role === 'supervisor' ? 'Supervisor Access' : 
                  currentUser.role === 'pm' ? 'Project Manager Access' : 'Employee Access'}` 
                : 'Login Required'}
            </p>
          </div>
          <div className="flex gap-6 text-sm ${themeColors.textLighter}">
            <a href="#" className="hover:text-blue-600">Twitter</a>
            <a href="#" className="hover:text-blue-600">LinkedIn</a>
            <a href="#" className="hover:text-blue-600">GitHub</a>
            <a href="#" className="hover:text-blue-600">Discord</a>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Memoized Global Styles Component
const GlobalStyles = memo(({ theme }: { theme: Theme }) => (
  <style jsx global>{`
    @font-face {
      font-family: 'OCR A';
      src: url('/fonts/OCRA.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    
    @media (hover: hover) and (pointer: fine) {
      * {
        cursor: none !important;
      }
    }
    
    @media (hover: none) and (pointer: coarse) {
      * {
        cursor: auto !important;
      }
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${theme.isDayTime ? '#f1f1f1' : '#1f2937'};
      border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${theme.isDayTime ? '#c0c0c0' : '#4b5563'};
      border-radius: 5px;
      border: 2px solid ${theme.isDayTime ? '#f1f1f1' : '#1f2937'};
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.isDayTime ? '#a8a8a8' : '#6b7280'};
    }
    
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      background-color: ${theme.isDayTime ? 'white' : '#111827'};
      font-family: system-ui, -apple-system, sans-serif;
      transition: background-color 0.3s ease;
    }
    
    /* Performance optimizations */
    .transform-gpu {
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    /* Reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `}</style>
));

export default function DashboardPage() {
  // Get user from context provider instead of creating own state
  const { currentUser: userFromContext, loading: userLoading } = useUser();
  const { theme: themeFromProvider } = useTheme();
  const router = useRouter();
  
  // Local state for UI
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOverText, setIsOverText] = useState(false);
  
  // Use currentUser from context, not local state
  const currentUser = userFromContext;
  
  // Theme state
  const [theme, setTheme] = useState<Theme>({
    isDayTime: true,
    backgroundImage: "/backgroundDay.jpg",
    theme: 'light'
  });
  
  // Tilt state
  const [tiltStates, setTiltStates] = useState<Record<string, TiltState>>({
    total: { tiltX: 0, tiltY: 0, isHovering: false },
    onTime: { tiltX: 0, tiltY: 0, isHovering: false },
    late: { tiltX: 0, tiltY: 0, isHovering: false },
    pending: { tiltX: 0, tiltY: 0, isHovering: false },
    bestEmployee: { tiltX: 0, tiltY: 0, isHovering: false },
    monthlyPerf: { tiltX: 0, tiltY: 0, isHovering: false },
    upcomingReviews: { tiltX: 0, tiltY: 0, isHovering: false },
    teamSatisfaction: { tiltX: 0, tiltY: 0, isHovering: false },
  });

  const contentRef = useRef<HTMLDivElement>(null);

  // Dashboard data types
  interface DashboardUser {
    id: number | string;
    name: string;
    email: string;
    role: string;
    department: string;
    created_at?: string;
  }

  interface AttendanceRecord {
    id: number;
    user_id: number | string;
    date: string;
    check_in: string;
    check_out?: string;
    status: 'on-time' | 'late';
  }

  interface TaskData {
    id: number;
    title: string;
    description?: string;
    status: 'pending' | 'completed' | 'in-progress';
    priority: 'low' | 'medium' | 'high';
    assignee_id: number | string;
    assigner_id: number | string;
    department: string;
    deadline?: string;
    progress?: number;
  }

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState<any>({
    totalEmployees: 0,
    onTimeToday: 0,
    lateToday: 0,
    pendingTasks: 0,
    completedTasks: 0,
    lateEmployees: [],
    tasksNeedingRevision: []
  });
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  // Work hours and settings state
  const [workHours, setWorkHours] = useState({
    startTime: '08:00',
    endTime: '18:00',
  });
  const [showWorkHoursEdit, setShowWorkHoursEdit] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<number | null>(null);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  // Redirect ke home jika user belum login (tapi tunggu loading selesai dulu!)
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, userLoading, router]);

  // Fetch dashboard data from API
  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoadingDashboard(true);

        // Fetch users data
        const usersResponse = await usersApi.getAll({ exclude_supervisors: true });
        const allUsers: DashboardUser[] = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || usersResponse);
        console.log('Dashboard - All users (non-supervisors):', allUsers);

        // Store all employees for work hours editing (supervisor only)
        if (currentUser.role === 'supervisor') {
          setAllEmployees(allUsers);
          // If no employee is selected yet, select the first one
          if (!selectedEmployeeForEdit && allUsers.length > 0) {
            const firstEmployeeId = typeof allUsers[0].id === 'string' ? parseInt(allUsers[0].id) : allUsers[0].id;
            setSelectedEmployeeForEdit(firstEmployeeId);
          }
        }

        // Fetch team members for PM
        let pmTeamMembers: DashboardUser[] = [];
        if (currentUser.role === 'pm') {
          try {
            const teamResponse = await teamApi.getTeamMembers();
            pmTeamMembers = Array.isArray(teamResponse) ? teamResponse : (teamResponse.data || teamResponse);
            console.log('Dashboard - PM team members:', pmTeamMembers);
          } catch (error) {
            console.log('Could not fetch PM team members, using department filter');
            pmTeamMembers = allUsers.filter((u: DashboardUser) => u.department === currentUser.department && u.id !== currentUser.id);
          }
        }

        // Fetch today's attendance
        const attendanceResponse = await attendanceApi.getAll({ date: new Date().toISOString().split('T')[0] });
        const todayAttendance: AttendanceRecord[] = Array.isArray(attendanceResponse.data) ? attendanceResponse.data : attendanceResponse;
        console.log('Dashboard - Today attendance:', todayAttendance);

        // Fetch all tasks
        const tasksResponse = await tasksApi.getAll();
        const allTasks: TaskData[] = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse.data || tasksResponse);
        console.log('Dashboard - All tasks:', allTasks);

        // Filter data based on user role
        let filteredUsers: DashboardUser[] = allUsers;
        let filteredAttendance: AttendanceRecord[] = todayAttendance;
        let filteredTasks: TaskData[] = allTasks;

        if (currentUser.role === 'pm') {
          // For PM, only show actual team members (from team_members relationship)
          filteredUsers = pmTeamMembers;
          filteredAttendance = todayAttendance.filter((a: AttendanceRecord) => 
            filteredUsers.some((u: DashboardUser) => u.id === a.user_id)
          );
          filteredTasks = allTasks.filter((t: TaskData) => 
            String(t.assigner_id) === currentUser.id || 
            (filteredUsers.some((u: DashboardUser) => u.id === t.assignee_id) && (t.status === 'pending' || t.status === 'in-progress'))
          );
        } else if (currentUser.role === 'employee') {
          // For employee, only show their own data
          filteredUsers = [{ ...currentUser, id: currentUser.id } as DashboardUser];
          filteredAttendance = todayAttendance.filter((a: AttendanceRecord) => String(a.user_id) === currentUser.id);
          filteredTasks = allTasks.filter((t: TaskData) => String(t.assignee_id) === currentUser.id);
        }

        // Calculate statistics
        const totalEmployees = filteredUsers.length;
        const onTimeCount = filteredAttendance.filter(a => a.status === 'on-time').length;
        const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
        const onTimePercentage = totalEmployees > 0 
          ? Math.round((onTimeCount / totalEmployees) * 100) 
          : 0;

        const pendingTasks = filteredTasks.filter((t: TaskData) => t.status === 'pending' || t.status === 'in-progress').length;
        const completedTasks = filteredTasks.filter((t: TaskData) => t.status === 'completed').length;

        // Get late employees (check_in > 09:00 and < 21:00)
        const lateEmployees = filteredAttendance
          .filter((a: AttendanceRecord) => a.status === 'late' && a.check_in)
          .map((a: AttendanceRecord) => {
            const employee = allUsers.find((u: DashboardUser) => u.id === a.user_id);
            return {
              name: employee?.name || 'Unknown',
              time: a.check_in,
              dept: employee?.department || 'N/A'
            };
          })
          .slice(0, 5); // Show top 5

        // Get tasks needing revision (pending + in-progress tasks ONLY, exclude 100% progress)
        const tasksNeedingRevision = filteredTasks
          .filter((t: TaskData) => (t.status === 'pending' || t.status === 'in-progress') && (t.progress ?? 0) < 100)
          .slice(0, 5) // Show top 5
          .map((t: TaskData) => ({
            id: t.id,
            title: t.title,
            employee: allUsers.find((u: DashboardUser) => u.id === t.assignee_id)?.name || 'Unknown',
            deadline: t.deadline || 'No deadline',
            priority: t.priority || 'Medium',
            progress: t.progress || 0 // Get actual progress from task data
          }));

        const finalData = {
          totalEmployees,
          onTimeToday: onTimePercentage,
          lateToday: lateCount,
          pendingTasks,
          completedTasks,
          lateEmployees,
          tasksNeedingRevision
        };

        console.log('Dashboard - Final calculated data:', finalData);
        setDashboardData(finalData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep default values if fetch fails
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // Data berdasarkan user role
  const roleBasedData = useMemo(() => {
    if (!currentUser) return {
      totalEmployees: dashboardData.totalEmployees,
      onTimeToday: dashboardData.onTimeToday,
      lateToday: dashboardData.lateToday,
      absentToday: 0,
      pendingTasks: dashboardData.pendingTasks,
      completedTasks: dashboardData.completedTasks,
      department: "All Departments",
      greeting: "Welcome to TechMaven Portal",
      departmentCount: 1,
      viewScope: "Company-wide",
      lateEmployees: dashboardData.lateEmployees,
      tasksNeedingRevision: dashboardData.tasksNeedingRevision,
      achievements: [],
      personalTasks: []
    };

    const baseData = {
      supervisor: {
        totalEmployees: dashboardData.totalEmployees,
        onTimeToday: dashboardData.onTimeToday,
        lateToday: dashboardData.lateToday,
        absentToday: 0,
        pendingTasks: dashboardData.pendingTasks,
        completedTasks: dashboardData.completedTasks,
        department: "All Departments",
        greeting: `Good Morning, ${currentUser.name}`,
        departmentCount: 6,
        viewScope: "Company-wide",
        lateEmployees: dashboardData.lateEmployees,
        tasksNeedingRevision: dashboardData.tasksNeedingRevision,
        achievements: [],
        personalTasks: []
      },
      pm: {
        totalEmployees: dashboardData.totalEmployees,
        onTimeToday: dashboardData.onTimeToday,
        lateToday: dashboardData.lateToday,
        absentToday: 0,
        pendingTasks: dashboardData.pendingTasks,
        completedTasks: dashboardData.completedTasks,
        department: currentUser.department,
        greeting: `Good Morning, ${currentUser.name}`,
        departmentCount: 1,
        viewScope: `${currentUser.department} Department`,
        lateEmployees: dashboardData.lateEmployees,
        tasksNeedingRevision: dashboardData.tasksNeedingRevision,
        achievements: [],
        personalTasks: []
      },
      employee: {
        totalEmployees: 1,
        onTimeToday: dashboardData.onTimeToday,
        lateToday: dashboardData.lateToday,
        absentToday: 0,
        pendingTasks: dashboardData.pendingTasks,
        completedTasks: dashboardData.completedTasks,
        department: currentUser.department,
        greeting: `Good Morning, ${currentUser.name}`,
        departmentCount: 1,
        viewScope: "Personal Dashboard",
        lateEmployees: [],
        tasksNeedingRevision: dashboardData.tasksNeedingRevision,
        achievements: [],
        personalTasks: dashboardData.tasksNeedingRevision,
        attendance: {
          clockIn: "08:45 AM",
          clockOut: "17:30 PM",
          totalHours: "8.75",
          status: "On Time"
        },
        performance: {
          rating: 4.5,
          completedTasks: dashboardData.completedTasks,
          onTimeRate: dashboardData.onTimeToday
        }
      }
    };

    return baseData[currentUser.role];
  }, [currentUser, dashboardData]);

  // Update stats dengan role-based data
  const stats = useMemo(() => ({
    totalEmployees: roleBasedData.totalEmployees,
    onTimeToday: roleBasedData.onTimeToday,
    lateToday: roleBasedData.lateToday,
    absentToday: roleBasedData.absentToday,
    pendingTasks: roleBasedData.pendingTasks,
    completedTasks: roleBasedData.completedTasks,
    bestEmployee: currentUser?.role === 'pm' ? "Team Lead" : 
                  currentUser?.role === 'employee' ? currentUser?.name : "Top Performer",
    bestEmployeeDept: roleBasedData.department,
    isLoading: isLoadingDashboard
  }), [roleBasedData, currentUser, isLoadingDashboard]);

  // Fungsi untuk tema - useCallback untuk mencegah re-render
  const toggleTheme = useCallback(() => {
    const newIsDayTime = !theme.isDayTime;
    const newTheme = {
      isDayTime: newIsDayTime,
      backgroundImage: newIsDayTime ? "/backgroundDay.jpg" : "/backgroundNight.jpg",
      theme: newIsDayTime ? 'light' : 'dark' as 'light' | 'dark'
    };
    setTheme(newTheme);
    localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
  }, [theme.isDayTime]);

  const setDayMode = useCallback(() => {
    const newTheme = {
      isDayTime: true,
      backgroundImage: "/backgroundDay.jpg",
      theme: 'light' as 'light' | 'dark'
    };
    setTheme(newTheme);
    localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
  }, []);

  const setNightMode = useCallback(() => {
    const newTheme = {
      isDayTime: false,
      backgroundImage: "/backgroundNight.jpg",
      theme: 'dark' as 'light' | 'dark'
    };
    setTheme(newTheme);
    localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new CustomEvent('userChange', { detail: null }));
    // Redirect to home page
    router.push('/');
  }, [router]);

  // Load tema dari localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      setTheme({
        ...parsedTheme,
        theme: parsedTheme.theme as 'light' | 'dark'
      });
    }
  }, []);

  // Load work hours dari API
  useEffect(() => {
    if (!currentUser) return;

    const loadWorkHours = async () => {
      try {
        const response = await workHoursApi.get();
        console.log('Work hours API response:', response);
        console.log('Current user:', currentUser);
        
        // Normalize API response - bisa array (supervisor/pm) atau single object (employee)
        let startTime = '08:00';
        let endTime = '18:00';
        
        if (response) {
          // If supervisor or PM gets array, find current user's work hours
          if (Array.isArray(response)) {
            console.log('DEBUG: Response is array, current user id:', currentUser?.id);
            console.log('DEBUG: All response items:', response.map((wh: any) => ({ user_id: wh.user_id, start_time: wh.start_time, end_time: wh.end_time })));
            
            const currentUserWorkHours = response.find((wh: any) => wh.user_id === currentUser?.id);
            console.log('DEBUG: Found current user work hours:', currentUserWorkHours);
            
            if (currentUserWorkHours) {
              startTime = (currentUserWorkHours.start_time || currentUserWorkHours.startTime || '08:00').substring(0, 5);
              endTime = (currentUserWorkHours.end_time || currentUserWorkHours.endTime || '18:00').substring(0, 5);
              console.log('DEBUG: Parsed from array:', { startTime, endTime });
            } else {
              console.warn('DEBUG: Current user not found in array, using first item');
              // If current user not found (supervisor viewing other), use first
              if (response.length > 0) {
                startTime = (response[0].start_time || response[0].startTime || '08:00').substring(0, 5);
                endTime = (response[0].end_time || response[0].endTime || '18:00').substring(0, 5);
              }
            }
          } else {
            // Single object response (employee)
            console.log('DEBUG: Response is single object');
            if (response.start_time || response.startTime) {
              startTime = (response.start_time || response.startTime).substring(0, 5);
            }
            if (response.end_time || response.endTime) {
              endTime = (response.end_time || response.endTime).substring(0, 5);
            }
            console.log('DEBUG: Parsed from single object:', { startTime, endTime });
          }
        }
        
        console.log('DEBUG: Setting work hours from API:', { startTime, endTime });
        setWorkHours({
          startTime,
          endTime
        });
      } catch (error) {
        console.error('Failed to load work hours:', error);
        // Fallback ke default
        setWorkHours({
          startTime: '08:00',
          endTime: '18:00'
        });
      }
    };

    // Only load on initial mount
    loadWorkHours();
    
    // Listen for work hours updates from other tabs via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    let interval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      channel = new BroadcastChannel('work-hours-update');
      channel.addEventListener('message', (event) => {
        if (event.data.type === 'WORK_HOURS_UPDATED') {
          console.log('Received work hours update from another tab:', event.data);
          // Only reload if not editing (modal is not open)
          if (!showWorkHoursEdit) {
            console.log('DEBUG: BroadcastChannel triggered reload');
            loadWorkHours();
          }
        }
      });
    } catch (e) {
      console.log('BroadcastChannel not supported in this browser');
    }
    
    // Refresh work hours setiap 5 detik untuk real-time sync tanpa mengandalkan localStorage
    // HANYA JIKA MODAL EDIT TIDAK TERBUKA
    if (!showWorkHoursEdit) {
      console.log('DEBUG: Modal closed, starting polling in 3 seconds');
      // Add 3-second delay before starting polling to avoid race condition
      // where polling fires immediately after save before UI fully updates
      timeoutId = setTimeout(() => {
        console.log('DEBUG: 3-second delay elapsed, starting polling');
        interval = setInterval(() => {
          console.log('DEBUG: Polling interval triggered, reloading work hours');
          loadWorkHours();
        }, 5000);
      }, 3000);
    } else {
      console.log('DEBUG: Modal edit is open, polling paused');
    }
    
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (interval) {
        clearInterval(interval);
      }
      if (channel) {
        channel.close();
      }
    };
    
    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (channel) {
        channel.close();
      }
    };
  }, [currentUser, showWorkHoursEdit]);

  // Optimasi efek mouse move dengan throttling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      );
    };
    
    if (typeof window !== "undefined") {
      checkMobile();
      
      let animationFrameId: number;
      let lastMouseMoveTime = 0;
      const MOUSE_MOVE_THROTTLE = 16; // ~60fps
      
      const handleMouseMove = (e: MouseEvent) => {
        if (isMobile) return;
        
        const now = performance.now();
        if (now - lastMouseMoveTime < MOUSE_MOVE_THROTTLE) return;
        lastMouseMoveTime = now;
        
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
          setCursorPosition({ x: e.clientX, y: e.clientY });
          const target = e.target as HTMLElement;
          
          const isTextElement =
            ["P", "SPAN", "H1", "H2", "H3", "A", "LI"].includes(target.tagName) ||
            target.classList.contains("text-") ||
            window.getComputedStyle(target).cursor === "text" ||
            window.getComputedStyle(target).display.includes("inline");
          setIsOverText(isTextElement);
          
          const isInteractive =
            ["A", "BUTTON"].includes(target.tagName) ||
            target.closest("a") !== null ||
            target.closest("button") !== null ||
            window.getComputedStyle(target).cursor === "pointer";
          setIsPointer(isInteractive);
        });
      };
      
      const handleCardMouseMove = (e: MouseEvent) => {
        const card = (e.target as HTMLElement).closest("[data-card]");
        if (!card) {
          setTiltStates((prev) => {
            const newStates = { ...prev };
            Object.keys(newStates).forEach((key) => {
              newStates[key] = { tiltX: 0, tiltY: 0, isHovering: false };
            });
            return newStates;
          });
          return;
        }
        
        const cardId = card.getAttribute("data-card");
        if (!cardId) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const tiltX = -(y / rect.height) * 15; // Reduced from 25
        const tiltY = (x / rect.width) * 15; // Reduced from 25
        
        setTiltStates((prev) => ({
          ...prev,
          [cardId]: { tiltX, tiltY, isHovering: true },
        }));
      };
      
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousemove", handleCardMouseMove);
      
      if (!isMobile) {
        document.body.style.cursor = "none";
      }
      
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mousemove", handleCardMouseMove);
        document.body.style.cursor = "auto";
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [isMobile]);

  // Memoized theme colors
  const themeColors = useMemo(() => {
    const baseColors = theme.isDayTime ? {
      bg: "bg-white",
      text: "text-gray-900",
      textLight: "text-gray-600",
      textLighter: "text-gray-500",
      border: "border-gray-200",
      borderLight: "border-gray-100",
      bgLight: "bg-gray-50",
      bgLighter: "bg-blue-50",
      cardBg: "bg-white",
      shadow: "shadow-lg",
      shadowHover: "0 30px 60px rgba(0,0,0,0.12)",
      gradientFrom: "from-blue-50",
      gradientTo: "to-white",
      heroText: "text-white",
      heroSubtext: "text-gray-200",
      iconBg: "bg-blue-50"
    } : {
      bg: "bg-gray-900",
      text: "text-gray-100",
      textLight: "text-gray-300",
      textLighter: "text-gray-400",
      border: "border-gray-700",
      borderLight: "border-gray-800",
      bgLight: "bg-gray-800",
      bgLighter: "bg-gray-800/50",
      cardBg: "bg-gray-800",
      shadow: "shadow-lg shadow-black/20",
      shadowHover: "0 30px 60px rgba(0,0,0,0.25)",
      gradientFrom: "from-gray-800",
      gradientTo: "to-gray-900",
      heroText: "text-white",
      heroSubtext: "text-gray-300",
      iconBg: "bg-blue-900/20"
    };
    
    // Tambahkan warna spesifik untuk card
    return {
      ...baseColors,
      blueIconBg: theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20',
      greenIconBg: theme.isDayTime ? 'bg-green-50' : 'bg-green-900/20',
      amberIconBg: theme.isDayTime ? 'bg-amber-50' : 'bg-amber-900/20',
      purpleIconBg: theme.isDayTime ? 'bg-purple-50' : 'bg-purple-900/20',
    };
  }, [theme.isDayTime]);

  // Tentukan icon untuk stat card berdasarkan role
  const getStatIcon = (cardId: string) => {
    if (currentUser?.role === "employee") {
      return cardId === "total" ? UserIcon :
             cardId === "onTime" ? CheckCircleIcon :
             cardId === "late" ? ClockIcon :
             BriefcaseIcon;
    }
    return cardId === "total" ? UsersIcon :
           cardId === "onTime" ? CheckCircleIcon :
           cardId === "late" ? ClockIcon :
           BriefcaseIcon;
  };

  // Tentukan title untuk stat card berdasarkan role
  const getStatTitle = (cardId: string) => {
    if (currentUser?.role === "employee") {
      return cardId === "total" ? "My Status" :
             cardId === "onTime" ? "Tasks Done" :
             cardId === "late" ? "Pending Review" :
             "My Tasks";
    }
    return cardId === "total" ? "Total Employees" :
           cardId === "onTime" ? "On Time Today" :
           cardId === "late" ? "Late Today" :
           "Pending Tasks";
  };

  // Jika belum login, tampilkan loading
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomCursor 
        isMobile={isMobile}
        cursorPosition={cursorPosition}
        isPointer={isPointer}
        isOverText={isOverText}
        theme={theme}
      />
      
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url("${theme.backgroundImage}")`,
          transition: "background-image 0.5s ease-in-out",
        }}
      >
        <div className="absolute inset-0 transition-all duration-500 ease-out"
          style={{
            backgroundColor: theme.isDayTime
              ? `rgba(255, 255, 255, 0.5)`
              : `rgba(0, 0, 0, 0.6)`
          }}
        />
        
        <ThemeToggle 
          theme={theme}
          toggleTheme={toggleTheme}
          setDayMode={setDayMode}
          setNightMode={setNightMode}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        
        <div className="relative z-10 text-center text-white px-4 w-full">
          <div className="transition-all duration-300 ease-out">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span style={{ fontFamily: "'OCR A', 'Courier New', monospace", letterSpacing: '-0.05em' }}>
                Good Morning, {currentUser.name}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              {currentUser.role === 'supervisor' ? 'Real-time monitoring of employee performance and attendance' :
               currentUser.role === 'pm' ? `${currentUser.department} department performance overview` :
               'Your personal performance dashboard'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Content */}
      <div
        ref={contentRef}
        className={`min-h-screen ${themeColors.bg} font-sans relative transition-colors duration-300`}
        style={{
          marginTop: "-1px",
        }}
      >
        <NavigationBar />
        
        {/* Quick Stats Bar */}
        <div className={`${theme.isDayTime ? 'bg-blue-50/50' : 'bg-gray-800/50'} border-b ${themeColors.borderLight}`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>
                    {currentUser.role === 'supervisor' ? 'Company Status:' :
                     currentUser.role === 'pm' ? 'Department Status:' : 'My Status:'}
                    <span className="font-semibold"> {currentUser.role === 'employee' ? 'Active' : 'Online'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>
                    {currentUser.role === 'supervisor' ? 'Active Users:' :
                     currentUser.role === 'pm' ? 'Active Team:' : 'Tasks Today:'}
                    <span className="font-semibold"> {stats.onTimeToday}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>
                    Last Sync: <span className="font-semibold">Just now</span>
                  </span>
                </div>
              </div>
             
              <div className="flex items-center gap-4">
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Export Data
                </button>
                <button className={`text-sm ${themeColors.textLight} hover:${themeColors.text} flex items-center gap-1`}>
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className={`text-2xl md:text-3xl font-bold ${themeColors.text}`}>
                  {currentUser.role === 'supervisor' ? `Good Morning, ${currentUser.name}` :
                   currentUser.role === 'pm' ? `Good Morning, ${currentUser.name}` : `Good Morning, ${currentUser.name}`}
                </h2>
                <p className={`${themeColors.textLight} mt-2`}>
                  {currentUser.role === 'supervisor' ? "Here's what's happening with all departments today" :
                   currentUser.role === 'pm' ? "Here's your Engineering team overview" :
                   "Here's your personal dashboard overview"}
                </p>
              </div>
             
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/attendance"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {currentUser.role === 'employee' ? 'My Attendance' : 'View Attendance'}
                </Link>
                <Link
                  href="/tasks"
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} transition-colors flex items-center gap-2`}
                >
                  {currentUser.role === 'employee' ? 'My Tasks' : 'Task Overview'}
                </Link>
                {currentUser.role !== 'employee' && (
                  <Link
                    href="/reports"
                    className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} transition-colors flex items-center gap-2`}
                  >
                    Generate Report
                  </Link>
                )}
              </div>
            </div>
           
            {/* Date and Time Info */}
            <div className={`mt-6 p-4 ${theme.isDayTime ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100' : 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700'} rounded-xl border`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className={`text-sm ${themeColors.textLight}`}>Current Date & Time</p>
                  <p className={`text-xl font-bold ${themeColors.text}`}>December 23, 2025 • {new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true})}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className={`text-sm ${themeColors.textLight}`}>
                        {currentUser.role === 'supervisor' ? 'Work Hours Today' :
                         currentUser.role === 'pm' ? 'Team Work Hours' : 'My Work Hours'}
                      </p>
                      <p className={`text-xl font-bold ${themeColors.text}`}>
                        {workHours.startTime} - {workHours.endTime}
                      </p>
                    </div>
                    {currentUser.role === 'supervisor' && (
                      <button 
                        onClick={() => setShowWorkHoursEdit(!showWorkHoursEdit)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {showWorkHoursEdit ? 'Done' : 'Edit'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${themeColors.textLight}`}>
                    {currentUser.role === 'supervisor' ? 'Office Status' :
                     currentUser.role === 'pm' ? 'Department Status' : 'My Status'}
                  </p>
                  <p className={`text-xl font-bold ${theme.isDayTime ? 'text-green-600' : 'text-green-400'}`}>
                    {currentUser.role === 'supervisor' ? 'Open • 72% Occupied' :
                     currentUser.role === 'pm' ? 'Active • 88% Present' : 'Active • On Time'}
                  </p>
                </div>
              </div>
              
              {/* Work Hours Edit Modal - Only for Supervisor */}
              {showWorkHoursEdit && currentUser.role === 'supervisor' && (
                <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                  {/* Time inputs - Global work hours for all users */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`text-sm ${themeColors.textLight} block mb-2`}>Start Time</label>
                      <input
                        type="time"
                        value={workHours.startTime}
                        onChange={(e) => {
                          setWorkHours({...workHours, startTime: e.target.value});
                        }}
                        className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                      />
                    </div>
                    <div>
                      <label className={`text-sm ${themeColors.textLight} block mb-2`}>End Time</label>
                      <input
                        type="time"
                        value={workHours.endTime}
                        onChange={(e) => {
                          setWorkHours({...workHours, endTime: e.target.value});
                        }}
                        className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={async () => {
                      try {
                        const newStartTime = workHours.startTime;
                        const newEndTime = workHours.endTime;
                        
                        console.log('DEBUG: About to save work hours', { startTime: newStartTime, endTime: newEndTime });
                        
                        // Save global work hours (no user_id means it applies to all users)
                        const response = await workHoursApi.update(newStartTime, newEndTime);
                        console.log('DEBUG: API Response:', response);
                        console.log('Work hours updated successfully for all users');
                        
                        // Notify other tabs about the update via BroadcastChannel
                        try {
                          const channel = new BroadcastChannel('work-hours-update');
                          channel.postMessage({
                            type: 'WORK_HOURS_UPDATED',
                            startTime: newStartTime,
                            endTime: newEndTime,
                            userId: currentUser?.id,
                            timestamp: new Date().toISOString()
                          });
                          channel.close();
                        } catch (e) {
                          console.log('BroadcastChannel not supported');
                        }
                        
                        // Show success message
                        alert('Work hours saved successfully for all users!');
                        
                        // IMMEDIATELY update display with the new values (trust what we just saved)
                        setWorkHours({ startTime: newStartTime, endTime: newEndTime });
                        
                        // Close modal FIRST (this pauses polling)
                        setShowWorkHoursEdit(false);
                        
                        // Then verify from API after a longer delay for database sync
                        setTimeout(async () => {
                          try {
                            const response = await workHoursApi.get();
                            console.log('DEBUG: Verification reload from API:', response);
                            
                            // Just verify it matches what we saved
                            let startTime = newStartTime;
                            let endTime = newEndTime;
                            
                            if (response) {
                              if (Array.isArray(response)) {
                                const userWH = response.find((wh: any) => wh.user_id === currentUser.id);
                                console.log('DEBUG: Found user work hours in array:', userWH);
                                if (userWH) {
                                  const dbStart = (userWH.start_time || userWH.startTime || '08:00').substring(0, 5);
                                  const dbEnd = (userWH.end_time || userWH.endTime || '18:00').substring(0, 5);
                                  console.log('DEBUG: Database has:', { dbStart, dbEnd });
                                  // Only override if different (shouldn't happen)
                                  if (dbStart !== newStartTime || dbEnd !== newEndTime) {
                                    console.warn('DEBUG: Database differs from saved values, updating');
                                    startTime = dbStart;
                                    endTime = dbEnd;
                                  }
                                }
                              } else {
                                if (response.start_time || response.startTime) {
                                  const dbStart = (response.start_time || response.startTime).substring(0, 5);
                                  console.log('DEBUG: Single response start_time:', dbStart);
                                  if (dbStart !== newStartTime) {
                                    startTime = dbStart;
                                  }
                                }
                                if (response.end_time || response.endTime) {
                                  const dbEnd = (response.end_time || response.endTime).substring(0, 5);
                                  console.log('DEBUG: Single response end_time:', dbEnd);
                                  if (dbEnd !== newEndTime) {
                                    endTime = dbEnd;
                                  }
                                }
                              }
                            }
                            
                            console.log('DEBUG: Final verified work hours:', { startTime, endTime });
                            // Update with verified data
                            setWorkHours({ startTime, endTime });
                          } catch (error) {
                            console.error('Failed to verify work hours from API:', error);
                            // Keep what we set (the saved values)
                          }
                        }, 2000);
                      } catch (error) {
                        console.error('Failed to update work hours:', error);
                        alert('Failed to update work hours');
                      }
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Save Work Hours
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Stats Cards - Different for Employee */}
          {currentUser.role === 'employee' ? (
            <PersonalDashboard 
              themeColors={themeColors} 
              personalData={roleBasedData} 
              theme={theme}
              currentUser={currentUser}
            />
          ) : (
            <>
              {/* Stats Cards untuk Supervisor dan PM */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  cardId="total"
                  title={getStatTitle("total")}
                  value={stats.totalEmployees}
                  icon={getStatIcon("total")}
                  color={themeColors.text}
                  subText={currentUser.role === 'pm' ? `${roleBasedData.department} Department` : "Across all departments"}
                  additionalContent={
                    <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                      <p className={`text-xs ${themeColors.textLighter}`}>
                        {currentUser.role === 'pm' ? `${stats.totalEmployees} team members` : `${stats.totalEmployees} total employees`}
                      </p>
                    </div>
                  }
                  tiltState={tiltStates.total}
                  themeColors={{...themeColors, iconBg: themeColors.blueIconBg}}
                />
                
                <StatCard
                  cardId="onTime"
                  title={getStatTitle("onTime")}
                  value={`${stats.onTimeToday}%`}
                  icon={getStatIcon("onTime")}
                  color="text-green-600"
                  subText={`${currentUser.role === 'pm' ? 'of team' : 'of staff'} on time`}
                  additionalContent={
                    <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${stats.onTimeToday}%` }}
                        ></div>
                      </div>
                    </div>
                  }
                  tiltState={tiltStates.onTime}
                  themeColors={{...themeColors, iconBg: themeColors.greenIconBg}}
                />
                
                <StatCard
                  cardId="late"
                  title={getStatTitle("late")}
                  value={stats.lateToday}
                  icon={getStatIcon("late")}
                  color="text-amber-600"
                  subText="Need attention"
                  additionalContent={
                    <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${themeColors.textLighter}`}>
                          {currentUser.role === 'pm' ? 'Team average: 10 mins' : 'Company average: 25 mins'}
                        </span>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Send Reminders
                        </button>
                      </div>
                    </div>
                  }
                  tiltState={tiltStates.late}
                  themeColors={{...themeColors, iconBg: themeColors.amberIconBg}}
                />
                
                <StatCard
                  cardId="pending"
                  title={getStatTitle("pending")}
                  value={stats.pendingTasks}
                  icon={getStatIcon("pending")}
                  color="text-purple-600"
                  subText="Need revision"
                  additionalContent={
                    <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${themeColors.textLighter}`}>
                          High Priority: {currentUser.role === 'pm' ? '5' : '12'}
                        </span>
                        <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                          Review All
                        </button>
                      </div>
                    </div>
                  }
                  tiltState={tiltStates.pending}
                  themeColors={{...themeColors, iconBg: themeColors.purpleIconBg}}
                />
              </div>
              
              {/* Main Grid Layout untuk Supervisor dan PM */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Late Employees Today */}
                  {roleBasedData.lateEmployees.length > 0 && (
                    <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} overflow-hidden`}>
                      <div className={`px-6 py-4 border-b ${themeColors.border} bg-gradient-to-r ${themeColors.gradientFrom} ${themeColors.gradientTo}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`text-lg font-semibold ${themeColors.text} flex items-center gap-2`}>
                              <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                              {currentUser.role === 'pm' ? 'Late Team Members Today' : 'Late Employees Today'}
                            </h3>
                            <p className={`text-sm ${themeColors.textLight} mt-1`}>
                              {currentUser.role === 'pm' ? 'Team members who arrived after 9:00 AM' : 'Employees who arrived after 9:00 AM'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                              {roleBasedData.lateEmployees.length} {currentUser.role === 'pm' ? 'members' : 'cases'}
                            </span>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                              View All
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {roleBasedData.lateEmployees.map((employee: any, index: number) => (
                          <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                    {employee.name.charAt(0)}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-xs text-white">!</span>
                                  </div>
                                </div>
                                <div>
                                  <p className={`font-medium ${themeColors.text} group-hover:text-blue-700`}>{employee.name}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-sm ${themeColors.textLighter} px-2 py-0.5 bg-gray-100 rounded`}>
                                      {employee.dept}
                                    </span>
                                    <span className={`text-sm ${themeColors.textLighter}`}>{employee.time}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                  {employee.reason}
                                </span>
                                <div className="mt-2 flex gap-2">
                                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Remind
                                  </button>
                                  <button className={`px-3 py-1 text-sm ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} transition-colors`}>
                                    Details
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className={`mt-3 pt-3 border-t ${themeColors.borderLight} flex items-center justify-between`}>
                              <span className={`text-xs ${themeColors.textLighter}`}>Expected arrival: 9:00 AM</span>
                              <span className="text-xs text-amber-600 font-medium">Late by 45 mins</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`px-6 py-4 border-t ${themeColors.border} ${themeColors.bgLight}`}>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${themeColors.textLight}`}>
                            Showing {roleBasedData.lateEmployees.length} of {stats.lateToday} {currentUser.role === 'pm' ? 'late team members' : 'late employees'}
                          </p>
                          <Link
                            href="/attendance"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            View {currentUser.role === 'pm' ? 'Team' : 'Attendance'} Dashboard
                            <ChevronRightIcon />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tasks Needing Revision */}
                  {roleBasedData.tasksNeedingRevision.length > 0 && (
                    <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} overflow-hidden`}>
                      <div className={`px-6 py-4 border-b ${themeColors.border} bg-gradient-to-r ${themeColors.gradientFrom} ${themeColors.gradientTo}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`text-lg font-semibold ${themeColors.text} flex items-center gap-2`}>
                              <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                              {currentUser.role === 'pm' ? 'Team Tasks Needing Revision' : 'Tasks Needing Revision'}
                            </h3>
                            <p className={`text-sm ${themeColors.textLight} mt-1`}>Require your immediate attention</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {roleBasedData.tasksNeedingRevision.length} pending
                            </span>
                            <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                              + Add Task
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {roleBasedData.tasksNeedingRevision.map((task: any) => (
                          <div key={task.id} className="px-6 py-4 hover:bg-purple-50/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span
                                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                                      task.priority === "High" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {task.priority} Priority
                                  </span>
                                  <span className={`text-xs ${themeColors.textLighter}`}>ID: #{task.id.toString().padStart(3, '0')}</span>
                                </div>
                                <p className={`font-medium ${themeColors.text} text-lg group-hover:text-purple-700`}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-4 mt-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-xs text-blue-700 font-bold">
                                        {task.employee.split(' ').map((n: string) => n[0]).join('')}
                                      </span>
                                    </div>
                                    <span className={`text-sm ${themeColors.textLight}`}>{task.employee}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className={`text-sm font-medium ${
                                      task.deadline === "Today" ? "text-red-600" :
                                      task.deadline === "Tomorrow" ? "text-amber-600" : themeColors.textLight
                                    }`}>
                                      Deadline: {task.deadline}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4 flex flex-col gap-2">
                                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                                  Review Now
                                </button>
                                <button className={`px-4 py-2 text-sm ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} transition-colors whitespace-nowrap`}>
                                  Delegate
                                </button>
                              </div>
                            </div>
                            <div className={`mt-4 pt-4 border-t ${themeColors.borderLight} flex items-center justify-between`}>
                              <div className="flex items-center gap-4">
                                <span className={`text-xs ${themeColors.textLighter}`}>Created: Dec 14, 2025</span>
                                <span className={`text-xs ${themeColors.textLighter}`}>Last updated: 2 hours ago</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs ${themeColors.textLighter}`}>Progress:</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                                </div>
                                <span className="text-xs font-medium">{task.progress}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`px-6 py-4 border-t ${themeColors.border} ${themeColors.bgLight}`}>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${themeColors.textLight}`}>
                            Total tasks completed today: {stats.completedTasks}
                          </p>
                          <Link
                            href="/tasks"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            Go to {currentUser.role === 'pm' ? 'Team' : 'Task'} Manager
                            <ChevronRightIcon />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Sidebar untuk Supervisor dan PM */}
                <div className="space-y-8">
                  {/* Best Employee Card */}
                  <div
                    data-card="bestEmployee"
                    className={`bg-gradient-to-br ${theme.isDayTime ? 'from-blue-500 to-blue-600' : 'from-blue-700 to-indigo-900'} rounded-xl p-6 text-white transform-gpu transition-all duration-300 ease-out relative overflow-hidden`}
                    style={{
                      transform: tiltStates.bestEmployee.isHovering
                        ? `perspective(1000px) rotateX(${tiltStates.bestEmployee.tiltX}deg) rotateY(${tiltStates.bestEmployee.tiltY}deg) translateZ(20px) scale(1.02)`
                        : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                      boxShadow: tiltStates.bestEmployee.isHovering
                        ? theme.isDayTime
                          ? "0 30px 60px rgba(59, 130, 246, 0.3)"
                          : "0 30px 60px rgba(59, 130, 246, 0.5)"
                        : theme.isDayTime
                          ? "0 10px 30px rgba(59, 130, 246, 0.2)"
                          : "0 10px 30px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <TrophyIcon />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-100">
                              {currentUser.role === 'pm' ? 'Top Team Member' : 'Employee of the Month'}
                            </p>
                            <p className="text-xs text-blue-200">December 2025</p>
                          </div>
                        </div>
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">
                          Winner 🏆
                        </span>
                      </div>
                     
                      <div className="text-center mb-6">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white/30 overflow-hidden bg-gradient-to-br from-white to-blue-100 flex items-center justify-center">
                          <span className="text-3xl font-bold text-blue-600">
                            {stats.bestEmployee.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stats.bestEmployee}</h3>
                        <p className="text-blue-100">{stats.bestEmployeeDept} Department</p>
                      </div>
                     
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold">98%</p>
                            <p className="text-xs text-blue-200">Task Completion</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">4.9</p>
                            <p className="text-xs text-blue-200">Rating</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">156</p>
                            <p className="text-xs text-blue-200">Projects</p>
                          </div>
                        </div>
                        <p className="text-sm mt-4 text-blue-100 text-center">
                          "Achieved exceptional results with innovative solutions."
                        </p>
                      </div>
                     
                      <button className="mt-6 w-full px-4 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                        View Full Profile
                      </button>
                    </div>
                  </div>
                  
                  {/* Recent Achievements */}
                  {roleBasedData.achievements.length > 0 && (
                    <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} overflow-hidden`}>
                      <div className={`px-6 py-4 border-b ${themeColors.border}`}>
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
                            {currentUser.role === 'pm' ? 'Team Achievements' : 'Recent Achievements'}
                          </h3>
                          <span className={`text-xs ${themeColors.textLighter} bg-gray-100 px-2 py-1 rounded`}>Q4 2025</span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {roleBasedData.achievements.map((item: any, index: number) => (
                          <div key={index} className="px-6 py-4 hover:bg-green-50/30 transition-colors group">
                            <div className="flex items-start gap-3">
                              <div className="relative">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0`}>
                                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                                {index === 0 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">1st</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className={`font-medium ${themeColors.text} group-hover:text-green-700`}>{item.employee}</p>
                                  <span className={`text-xs ${themeColors.textLighter}`}>2 days ago</span>
                                </div>
                                <p className={`text-sm ${themeColors.textLight} mt-1`}>{item.achievement}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs px-2 py-1 ${theme.isDayTime ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/30 text-blue-300'} rounded`}>
                                    {item.department}
                                  </span>
                                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                    Congratulate
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`px-6 py-4 border-t ${themeColors.border} ${themeColors.bgLight}`}>
                        <button className={`w-full text-center text-sm ${themeColors.textLight} hover:${themeColors.text} font-medium`}>
                          View All Achievements →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Bottom Stats Section untuk Supervisor dan PM */}
          {currentUser.role !== 'employee' && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                data-card="monthlyPerf"
                className={`bg-gradient-to-br ${theme.isDayTime ? 'from-purple-50 to-white' : 'from-purple-900/20 to-gray-900'} rounded-xl p-6 border ${theme.isDayTime ? 'border-purple-100' : 'border-purple-800'} transform-gpu transition-all duration-300 ease-out`}
                style={{
                  transform: tiltStates.monthlyPerf.isHovering
                    ? `perspective(1000px) rotateX(${tiltStates.monthlyPerf.tiltX}deg) rotateY(${tiltStates.monthlyPerf.tiltY}deg) translateZ(20px) scale(1.02)`
                    : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${theme.isDayTime ? 'from-purple-500 to-purple-600' : 'from-purple-600 to-purple-700'} rounded-xl`}>
                    <BarChartIcon />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${themeColors.textLight}`}>
                      {currentUser.role === 'pm' ? 'Team Performance' : 'Monthly Performance'}
                    </p>
                    <div className="flex items-end justify-between">
                      <p className={`text-3xl font-bold ${themeColors.text} mt-1`}>
                        {currentUser.role === 'pm' ? '91.2%' : '87.5%'}
                      </p>
                      <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                        ↑ {currentUser.role === 'pm' ? '3.1%' : '2.3%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div className={`bg-gradient-to-r ${theme.isDayTime ? 'from-purple-500 to-purple-600' : 'from-purple-600 to-purple-700'} h-2 rounded-full`} 
                           style={{ width: currentUser.role === 'pm' ? '91.2%' : '87.5%' }}></div>
                    </div>
                    <p className={`text-xs ${themeColors.textLighter} mt-2`}>
                      {currentUser.role === 'pm' ? 'Based on 120+ team tasks' : 'Based on 450+ completed tasks'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div
                data-card="upcomingReviews"
                className={`bg-gradient-to-br ${theme.isDayTime ? 'from-green-50 to-white' : 'from-green-900/20 to-gray-900'} rounded-xl p-6 border ${theme.isDayTime ? 'border-green-100' : 'border-green-800'} transform-gpu transition-all duration-300 ease-out`}
                style={{
                  transform: tiltStates.upcomingReviews.isHovering
                    ? `perspective(1000px) rotateX(${tiltStates.upcomingReviews.tiltX}deg) rotateY(${tiltStates.upcomingReviews.tiltY}deg) translateZ(20px) scale(1.02)`
                    : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${theme.isDayTime ? 'from-green-500 to-green-600' : 'from-green-600 to-green-700'} rounded-xl`}>
                    <CalendarIcon />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${themeColors.textLight}`}>
                      {currentUser.role === 'pm' ? 'Team Reviews' : 'Upcoming Reviews'}
                    </p>
                    <div className="flex items-end justify-between">
                      <p className={`text-3xl font-bold ${themeColors.text} mt-1`}>
                        {currentUser.role === 'pm' ? '8' : '24'}
                      </p>
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {currentUser.role === 'pm' ? 'This Week' : 'Next Week'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className={`text-xs ${themeColors.textLighter}`}>
                          {currentUser.role === 'pm' ? 'Team Performance' : 'Performance Appraisal'}
                        </p>
                        <p className={`text-sm font-medium ${themeColors.text}`}>
                          {currentUser.role === 'pm' ? 'Dec 18-19, 2025' : 'Dec 18-22, 2025'}
                        </p>
                      </div>
                      <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div
                data-card="teamSatisfaction"
                className={`bg-gradient-to-br ${theme.isDayTime ? 'from-blue-50 to-white' : 'from-blue-900/20 to-gray-900'} rounded-xl p-6 border ${theme.isDayTime ? 'border-blue-100' : 'border-blue-800'} transform-gpu transition-all duration-300 ease-out`}
                style={{
                  transform: tiltStates.teamSatisfaction.isHovering
                    ? `perspective(1000px) rotateX(${tiltStates.teamSatisfaction.tiltX}deg) rotateY(${tiltStates.teamSatisfaction.tiltY}deg) translateZ(20px) scale(1.02)`
                    : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${theme.isDayTime ? 'from-blue-500 to-blue-600' : 'from-blue-600 to-blue-700'} rounded-xl`}>
                    <UsersIcon />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${themeColors.textLight}`}>
                      {currentUser.role === 'pm' ? 'Team Satisfaction' : 'Employee Satisfaction'}
                    </p>
                    <div className="flex items-end justify-between">
                      <p className={`text-3xl font-bold ${themeColors.text} mt-1`}>
                        {currentUser.role === 'pm' ? '94%' : '92%'}
                      </p>
                      <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                        ↑ {currentUser.role === 'pm' ? '5%' : '4%'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${themeColors.text}`}>
                          {currentUser.role === 'pm' ? '4.7' : '4.6'}
                        </p>
                        <p className={`text-xs ${themeColors.textLighter}`}>Rating</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${themeColors.text}`}>
                          {currentUser.role === 'pm' ? '92%' : '89%'}
                        </p>
                        <p className={`text-xs ${themeColors.textLighter}`}>Retention</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${themeColors.text}`}>
                          {currentUser.role === 'pm' ? '96' : '94'}
                        </p>
                        <p className={`text-xs ${themeColors.textLighter}`}>Response</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Newsletter & Updates untuk Supervisor dan PM */}
          {currentUser.role !== 'employee' && (
            <div className={`mt-12 bg-gradient-to-r ${theme.isDayTime ? 'from-blue-50 to-indigo-50' : 'from-gray-800 to-gray-900'} rounded-xl p-8 border ${theme.isDayTime ? 'border-blue-200' : 'border-gray-700'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className={`text-xl font-bold ${themeColors.text}`}>Stay Updated</h3>
                  <p className={`${themeColors.textLight} mt-2`}>
                    {currentUser.role === 'pm' 
                      ? 'Subscribe to team performance reports and updates' 
                      : 'Subscribe to weekly performance reports and updates'}
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`px-4 py-3 border ${themeColors.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none md:w-64 ${themeColors.bgLight} ${themeColors.text}`}
                  />
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <Footer themeColors={themeColors} theme={theme} currentUser={currentUser} />
      </div>
      
      <GlobalStyles theme={theme} />
    </>
  );
}