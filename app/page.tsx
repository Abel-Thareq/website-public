"use client";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { User } from "./types/user";

interface Theme {
  isDayTime: boolean;
  backgroundImage: string;
  theme: 'light' | 'dark';
}

// Available users untuk fast access
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

// Memoized Icon Components
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
  setNightMode
}: { 
  theme: Theme;
  toggleTheme: () => void;
  setDayMode: () => void;
  setNightMode: () => void;
}) => (
  <div className="absolute top-4 right-4 z-20">
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

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>({
    isDayTime: true,
    backgroundImage: "/backgroundDay.jpg",
    theme: 'light'
  });
  
  // Login modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'supervisor' | 'pm' | 'employee' | null>(null);
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    username: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Typing effect state
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const heroTextScale = 1 - scrollProgress * 0.25;
  const heroTextTranslateY = scrollProgress * 40;
  const heroTextOpacity = Math.max(1 - scrollProgress * 1.5, 0);
  const overlayDarkness = theme.isDayTime ? 0.3 + scrollProgress * 0.5 : 0.6 + scrollProgress * 0.3;
  const heroSectionOpacity = Math.max(1 - scrollProgress * 1.2, 0);
  const contentOpacity = Math.min(scrollProgress * 1.5, 1);
  const contentTranslateY = (1 - contentOpacity) * 30;

  // Greeting texts
  const greetingTexts = [
    "Welcome to TechMaven Portal",
    "Employee Monitoring System",
    "Please login to continue"
  ];

  // Typing animation effect
  useEffect(() => {
    if (greetingTexts.length === 0) return;
    
    const currentText = greetingTexts[loopIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(currentText.substring(0, displayedText.length + 1));
        if (displayedText === currentText) {
          setTimeout(() => setIsDeleting(true), 2000);
          setTypingSpeed(80);
        }
      } else {
        setDisplayedText(currentText.substring(0, displayedText.length - 1));
        if (displayedText === "") {
          setIsDeleting(false);
          setLoopIndex((prev) => (prev + 1) % greetingTexts.length);
          setTypingSpeed(150);
        }
      }
    }, typingSpeed);
    
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, loopIndex, typingSpeed, greetingTexts]);

  // Fungsi untuk tema
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

  // Handle open login modal
  const handleOpenLoginModal = (role: 'supervisor' | 'pm' | 'employee') => {
    setSelectedRole(role);
    setIsLoginModalOpen(true);
    setLoginTab('login');
    setCredentials({ username: '', password: '' });
    setRegisterData({ name: '', email: '', username: '', password: '', confirmPassword: '' });
    setLoginError('');
  };

  // Handle login
  const handleLogin = () => {
    setLoginError('');
    
    const user = availableUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      // Check if role matches (optional validation)
      if (selectedRole && user.role !== selectedRole) {
        setLoginError(`This account is for ${user.role}, not ${selectedRole}`);
        return;
      }

      const { password, ...userWithoutPassword } = user;
      
      setIsLoggingIn(true);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('userChange', { detail: userWithoutPassword }));
      
      // Close modal
      setIsLoginModalOpen(false);
      
      // Redirect to dashboard with full page reload
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // Handle fast access login
  const handleFastAccessLogin = (user: User) => {
    // Check if role matches (optional validation)
    if (selectedRole && user.role !== selectedRole) {
      setLoginError(`This is a ${user.role} account. Please select the correct role.`);
      return;
    }

    const { password, ...userWithoutPassword } = user;
    
    setIsLoggingIn(true);
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('userChange', { detail: userWithoutPassword }));
    
    // Close modal
    setIsLoginModalOpen(false);
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 100);
  };

  // Handle register (placeholder - you can implement later)
  const handleRegister = () => {
    if (registerData.password !== registerData.confirmPassword) {
      setLoginError('Passwords do not match');
      return;
    }
    
    if (!registerData.name || !registerData.email || !registerData.username || !registerData.password) {
      setLoginError('Please fill in all fields');
      return;
    }
    
    // Placeholder for registration logic
    setLoginError('Registration feature coming soon!');
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (loginTab === 'login') {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  };

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

    const handleScroll = () => {
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        const scrollPosition = window.scrollY;
        const progress = Math.min(scrollPosition / (heroHeight * 0.7), 1);
        setScrollProgress(progress);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Theme colors untuk landing page
  const themeColors = theme.isDayTime ? {
    bg: "bg-white",
    text: "text-gray-900",
    textLight: "text-gray-600",
    textLighter: "text-gray-500",
    border: "border-gray-200",
    borderLight: "border-gray-100",
    bgLight: "bg-gray-50",
    cardBg: "bg-white",
    shadow: "shadow-lg",
    heroText: "text-white",
    heroSubtext: "text-gray-200",
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
    heroText: "text-white",
    heroSubtext: "text-gray-300",
  };

  // Get role display info
  const getRoleDisplayInfo = () => {
    if (!selectedRole) return { title: 'Login', color: 'blue', icon: 'L' };
    
    const roleInfo: Record<'supervisor' | 'pm' | 'employee', { title: string; color: string; icon: string }> = {
      supervisor: { title: 'Supervisor Login', color: 'purple', icon: 'SV' },
      pm: { title: 'Project Manager Login', color: 'blue', icon: 'PM' },
      employee: { title: 'Employee Login', color: 'green', icon: 'E' }
    };
    
    return roleInfo[selectedRole];
  };

  return (
    <>
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url("${theme.backgroundImage}")`,
          opacity: heroSectionOpacity,
          transition: "opacity 0.3s ease-out, background-image 0.5s ease-in-out",
        }}
      >
        <div
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={{
            backgroundColor: theme.isDayTime
              ? `rgba(255, 255, 255, ${overlayDarkness})`
              : `rgba(0, 0, 0, ${overlayDarkness})`
          }}
        />
        
        <ThemeToggle 
          theme={theme}
          toggleTheme={toggleTheme}
          setDayMode={setDayMode}
          setNightMode={setNightMode}
        />
        
        <div className="relative z-10 text-center text-white px-4 w-full">
          <div
            className="transition-all duration-300 ease-out"
            style={{
              transform: `translateY(${heroTextTranslateY}px) scale(${heroTextScale})`,
              opacity: heroTextOpacity,
            }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span style={{ fontFamily: "'OCR A', 'Courier New', monospace", letterSpacing: '-0.05em'}}>
                {displayedText}
              </span>
              <span className={`inline-block w-1 h-8 ml-1 animate-pulse opacity-80 ${
                theme.isDayTime ? 'bg-white' : 'bg-blue-400'
              }`}>|</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              Employee Monitoring & Performance Management System
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg"
              >
                Login to Continue
              </button>
              <Link
                href="#features"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors text-lg font-medium border border-white/30 text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
          
          <div
            className="mt-20 transition-all duration-300"
            style={{
              opacity: 1 - scrollProgress * 3,
              transform: `translateY(${scrollProgress * 20}px)`,
            }}
          >
            <div className="flex flex-col items-center">
              <span className={`text-sm mb-2 ${theme.isDayTime ? 'text-gray-300' : 'text-gray-400'}`}>
                Scroll to learn more
              </span>
              <div className={`w-6 h-10 border-2 rounded-full flex justify-center ${
                theme.isDayTime ? 'border-gray-300' : 'border-gray-500'
              }`}>
                <div className={`w-1 h-3 rounded-full mt-2 animate-bounce ${
                  theme.isDayTime ? 'bg-white' : 'bg-blue-400'
                }`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div
        className={`min-h-screen ${themeColors.bg} font-sans relative transition-colors duration-300`}
        style={{
          opacity: contentOpacity,
          transform: `translateY(${contentTranslateY}px)`,
          transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
          marginTop: "-1px",
        }}
      >
        <div className="container mx-auto px-4 py-16 max-w-7xl" id="features">
          <h2 className={`text-4xl font-bold text-center mb-12 ${themeColors.text}`}>
            Available User Roles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Supervisor Card */}
            <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 text-center`}>
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold`}>
                SV
              </div>
              <h3 className={`text-2xl font-bold ${themeColors.text} mb-4`}>Supervisor</h3>
              <p className={`${themeColors.textLight} mb-6`}>
                Full access to monitor all departments and company-wide performance metrics.
              </p>
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Monitor all departments</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Company-wide analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>124+ employees</span>
                </div>
              </div>
              <button
                onClick={() => handleOpenLoginModal('supervisor')}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Login as Supervisor
              </button>
            </div>
            
            {/* PM Card */}
            <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 text-center`}>
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold`}>
                PM
              </div>
              <h3 className={`text-2xl font-bold ${themeColors.text} mb-4`}>Project Manager</h3>
              <p className={`${themeColors.textLight} mb-6`}>
                Department-specific monitoring with team management and performance tracking.
              </p>
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Single department view</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Team performance tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>25 team members</span>
                </div>
              </div>
              <button
                onClick={() => handleOpenLoginModal('pm')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login as PM
              </button>
            </div>
            
            {/* Employee Card */}
            <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 text-center`}>
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold`}>
                E
              </div>
              <h3 className={`text-2xl font-bold ${themeColors.text} mb-4`}>Employee</h3>
              <p className={`${themeColors.textLight} mb-6`}>
                Personal dashboard with task management, attendance tracking, and performance reviews.
              </p>
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Personal dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Task management</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Attendance tracking</span>
                </div>
              </div>
              <button
                onClick={() => handleOpenLoginModal('employee')}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Login as Employee
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    {selectedRole && (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                        selectedRole === 'supervisor' ? 'from-purple-500 to-purple-600' :
                        selectedRole === 'pm' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'
                      } flex items-center justify-center text-white text-sm font-bold`}>
                        {getRoleDisplayInfo().icon}
                      </div>
                    )}
                    <span>{getRoleDisplayInfo().title}</span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRole 
                      ? `Login as ${selectedRole === 'pm' ? 'Project Manager' : selectedRole}`
                      : 'Login to your account'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setSelectedRole(null);
                    setLoginError('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setLoginTab('login');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-all ${
                    loginTab === 'login'
                      ? 'bg-white text-blue-600 shadow-sm font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setLoginTab('register');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-all ${
                    loginTab === 'register'
                      ? 'bg-white text-blue-600 shadow-sm font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Register
                </button>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              {/* Login Tab */}
              {loginTab === 'login' ? (
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

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or fast access</span>
                    </div>
                  </div>

                  {/* Fast Access Accounts */}
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 font-medium">Available Accounts:</p>
                    {availableUsers
                      .filter(user => !selectedRole || user.role === selectedRole)
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-4 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group"
                          onClick={() => handleFastAccessLogin(user)}
                        >
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${user.color} flex items-center justify-center text-white text-lg font-bold flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            {user.initials}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 group-hover:text-blue-700">{user.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{user.role} • {user.department}</p>
                          </div>
                          <div className="text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Login →
                          </div>
                        </div>
                      ))}
                  </div>

                  {selectedRole && (
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 mt-4"
                    >
                      View all accounts
                    </button>
                  )}
                </div>
              ) : (
                /* Register Tab */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Choose a username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button
                    onClick={handleRegister}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By registering, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoggingIn && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-900 font-medium">Logging in...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait</p>
          </div>
        </div>
      )}
      
      <GlobalStyles theme={theme} />
    </>
  );
}

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