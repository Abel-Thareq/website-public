"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface TiltState {
  tiltX: number;
  tiltY: number;
  isHovering: boolean;
}

export default function Home() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOverText, setIsOverText] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Typing effect state
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const greetingTexts = [
    "Good Morning, TechMaven",
    "Welcome Back, TechMaven",
    "How was your day?",
    "Ready to lead today?",
    "Great to see you again!",
  ];

  // Tilt state diperluas untuk semua card yang ingin punya efek float
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

  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Data statistik
  const stats = {
    totalEmployees: 124,
    onTimeToday: 89,
    lateToday: 12,
    absentToday: 8,
    pendingTasks: 47,
    completedTasks: 156,
    bestEmployee: "Sarah Chen",
    bestEmployeeDept: "Engineering",
  };

  const lateEmployees = [
    { name: "Alex Johnson", time: "09:15", reason: "Traffic", dept: "Marketing" },
    { name: "Maria Garcia", time: "09:30", reason: "Personal", dept: "HR" },
    { name: "David Kim", time: "09:45", reason: "Transport", dept: "Sales" },
    { name: "Lisa Wong", time: "10:00", reason: "Meeting", dept: "Finance" },
  ];

  const tasksNeedingRevision = [
    { id: 1, title: "Q3 Marketing Report", employee: "Tom Wilson", deadline: "Today", priority: "High" },
    { id: 2, title: "Software Update Docs", employee: "Jane Smith", deadline: "Tomorrow", priority: "Medium" },
    { id: 3, title: "Client Presentation", employee: "Mike Brown", deadline: "2 days", priority: "High" },
  ];

  const achievements = [
    { employee: "Sarah Chen", achievement: "Best Code Review Q2", department: "Engineering" },
    { employee: "James Wilson", achievement: "Highest Sales Q2", department: "Sales" },
    { employee: "Emma Davis", achievement: "Most Innovative Solution", department: "Product" },
  ];

  // Typing animation effect
  useEffect(() => {
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
  }, [displayedText, isDeleting, loopIndex, typingSpeed]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      );
    };

    const handleScroll = () => {
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        const scrollPosition = window.scrollY;
        const progress = Math.min(scrollPosition / (heroHeight * 0.7), 1);
        setScrollProgress(progress);
      }
    };

    if (typeof window !== "undefined") {
      checkMobile();

      const handleMouseMove = (e: MouseEvent) => {
        if (isMobile) return;
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

        const tiltX = -(y / rect.height) * 25;
        const tiltY = (x / rect.width) * 25;

        setTiltStates((prev) => ({
          ...prev,
          [cardId]: { tiltX, tiltY, isHovering: true },
        }));
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousemove", handleCardMouseMove);
      window.addEventListener("scroll", handleScroll);

      if (!isMobile) {
        document.body.style.cursor = "none";
      }

      handleScroll();

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mousemove", handleCardMouseMove);
        window.removeEventListener("scroll", handleScroll);
        document.body.style.cursor = "auto";
      };
    }
  }, [isMobile]);

  const heroTextScale = 1 - scrollProgress * 0.25;
  const heroTextTranslateY = scrollProgress * 40;
  const heroTextOpacity = Math.max(1 - scrollProgress * 1.5, 0);
  const overlayDarkness = 0.3 + scrollProgress * 0.5;
  const heroSectionOpacity = Math.max(1 - scrollProgress * 1.2, 0);
  const contentOpacity = Math.min(scrollProgress * 1.5, 1);
  const contentTranslateY = (1 - contentOpacity) * 30;

  const Icons = {
    Users: () => (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.197v-1a6 6 0 00-4.5-5.803" />
      </svg>
    ),
    CheckCircle: () => (
      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Clock: () => (
      <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Briefcase: () => (
      <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    Trophy: () => (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    BarChart: () => (
      <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    Calendar: () => (
      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    Bell: () => (
      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    MapPin: () => (
      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    MessageSquare: () => (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  };

  return (
    <>
      {/* Custom Cursor */}
      {!isMobile && (
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
            } ${isOverText ? "bg-transparent" : "bg-blue-600/20"}`}
            style={{
              width: isPointer ? "24px" : "20px",
              height: isPointer ? "24px" : "20px",
              border: isOverText ? "2px solid rgba(59, 130, 246, 0.5)" : "none",
              boxShadow: isOverText ? "0 0 0 1px rgba(255, 255, 255, 0.5) inset" : "none",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
              display: isPointer ? "none" : "block",
            }}
          />
        </div>
      )}

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: 'url("/background.jpg")',
          opacity: heroSectionOpacity,
          transition: "opacity 0.5s ease-out",
        }}
      >
        <div
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={{ backgroundColor: `rgba(255, 255, 255, ${overlayDarkness})` }}
        />

        <div className="relative z-10 text-center text-white px-4 w-full">
          <div
            className="transition-all duration-500 ease-out"
            style={{
              transform: `translateY(${heroTextTranslateY}px) scale(${heroTextScale})`,
              opacity: heroTextOpacity,
            }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span style={{ fontFamily: "'OCR A', 'Courier New', monospace", letterSpacing: '-0.05em' }}>
                {displayedText}
              </span>
              <span className="inline-block w-1 h-8 bg-white ml-1 animate-pulse opacity-80">|</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              Real-time monitoring of employee performance and attendance
            </p>

            <div
              className="mt-20 transition-all duration-500"
              style={{
                opacity: 1 - scrollProgress * 3,
                transform: `translateY(${scrollProgress * 20}px)`,
              }}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm mb-2 text-gray-300">Scroll to continue</span>
                <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div
        ref={contentRef}
        className="min-h-screen bg-white font-sans relative"
        style={{
          opacity: contentOpacity,
          transform: `translateY(${contentTranslateY}px)`,
          transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          marginTop: "-1px",
        }}
      >
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                    <Image
                      src="/logo TechMaven.png"
                      alt="TechMaven Logo"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">TechMedia TechMaven Portal</h1>
                    <p className="text-sm text-gray-500">Employee Monitoring System • Est. 2025</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-sm">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      activeTab === "dashboard"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab("attendance")}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      activeTab === "attendance"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      activeTab === "tasks"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      activeTab === "reports"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Reports
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button className="relative p-2 rounded-full hover:bg-gray-100">
                    <Icons.Bell />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Good Morning, Tech<span className="text-blue-600">Maven</span>
            </h2>
            <p className="text-gray-600 mt-2">
              Real-time monitoring of employee performance and attendance
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              data-card="total"
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform-gpu transition-all duration-500 ease-out"
              style={{
                transform: tiltStates.total.isHovering
                  ? `perspective(1000px) rotateX(${tiltStates.total.tiltX}deg) rotateY(${tiltStates.total.tiltY}deg) translateZ(40px) scale(1.05)`
                  : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                boxShadow: tiltStates.total.isHovering
                  ? "0 30px 60px rgba(0,0,0,0.15)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</p>
                </div>
                <Icons.Users />
              </div>
            </div>

            <div
              data-card="onTime"
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform-gpu transition-all duration-500 ease-out"
              style={{
                transform: tiltStates.onTime.isHovering
                  ? `perspective(1000px) rotateX(${tiltStates.onTime.tiltX}deg) rotateY(${tiltStates.onTime.tiltY}deg) translateZ(40px) scale(1.05)`
                  : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                boxShadow: tiltStates.onTime.isHovering
                  ? "0 30px 60px rgba(0,0,0,0.15)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Time Today</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{stats.onTimeToday}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((stats.onTimeToday / stats.totalEmployees) * 100).toFixed(1)}% of staff
                  </p>
                </div>
                <Icons.CheckCircle />
              </div>
            </div>

            <div
              data-card="late"
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform-gpu transition-all duration-500 ease-out"
              style={{
                transform: tiltStates.late.isHovering
                  ? `perspective(1000px) rotateX(${tiltStates.late.tiltX}deg) rotateY(${tiltStates.late.tiltY}deg) translateZ(40px) scale(1.05)`
                  : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                boxShadow: tiltStates.late.isHovering
                  ? "0 30px 60px rgba(0,0,0,0.15)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Late Today</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">{stats.lateToday}</p>
                  <p className="text-xs text-gray-500 mt-1">Need attention</p>
                </div>
                <Icons.Clock />
              </div>
            </div>

            <div
              data-card="pending"
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform-gpu transition-all duration-500 ease-out"
              style={{
                transform: tiltStates.pending.isHovering
                  ? `perspective(1000px) rotateX(${tiltStates.pending.tiltX}deg) rotateY(${tiltStates.pending.tiltY}deg) translateZ(40px) scale(1.05)`
                  : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                boxShadow: tiltStates.pending.isHovering
                  ? "0 30px 60px rgba(0,0,0,0.15)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{stats.pendingTasks}</p>
                  <p className="text-xs text-gray-500 mt-1">Need revision</p>
                </div>
                <Icons.Briefcase />
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Late Employees Today */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Late Employees Today</h3>
                    <span className="text-sm text-gray-500">{lateEmployees.length} cases</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {lateEmployees.map((employee, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.dept} • {employee.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-amber-600">{employee.reason}</p>
                          <button className="mt-2 text-sm text-blue-600 hover:underline">
                            Send Reminder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Needing Revision */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Tasks Needing Revision</h3>
                    <span className="text-sm text-gray-500">{tasksNeedingRevision.length} pending</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {tasksNeedingRevision.map((task) => (
                    <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                task.priority === "High" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {task.priority}
                            </span>
                            <p className="font-medium text-gray-900">{task.title}</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {task.employee} • Deadline: {task.deadline}
                          </p>
                        </div>
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Best TechMaven of the Month - dengan efek tilt */}
              <div
                data-card="bestEmployee"
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white transform-gpu transition-all duration-500 ease-out"
                style={{
                  transform: tiltStates.bestEmployee.isHovering
                    ? `perspective(1000px) rotateX(${tiltStates.bestEmployee.tiltX}deg) rotateY(${tiltStates.bestEmployee.tiltY}deg) translateZ(40px) scale(1.05)`
                    : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                  boxShadow: tiltStates.bestEmployee.isHovering
                    ? "0 30px 60px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(0,0,0,0.2)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icons.Trophy />
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">December 2025</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Best TechMaven of the Month</h3>
                <p className="text-2xl font-bold mb-4">{stats.bestEmployee}</p>
                <p className="text-blue-100">{stats.bestEmployeeDept} Department</p>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm">Achieved 98% task completion rate with exceptional leadership.</p>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {achievements.map((item, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.employee}</p>
                          <p className="text-sm text-gray-600">{item.achievement}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.department}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Information & Suggestions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Office Information</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-6">
                    <Icons.MapPin />
                    <div>
                      <p className="font-medium text-gray-900">TechMedia Headquarters</p>
                      <p className="text-sm text-gray-600">123 Innovation Drive, San Francisco, CA</p>
                      <p className="text-sm text-gray-500">Office Hours: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Icons.MessageSquare />
                      <p className="font-medium text-gray-900">Employee Suggestions</p>
                    </div>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontFamily: "'OCR A', monospace", color: "#000000" }}
                      rows={3}
                      placeholder="Share your suggestions or feedback..."
                    ></textarea>
                    <button className="mt-3 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Submit Suggestion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats - dengan efek tilt */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              data-card="monthlyPerf"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transform-gpu transition-all duration-500 ease-out"
              style={{
                transform: tiltStates.monthlyPerf.isHovering
                  ? `perspective(1000px) rotateX(${tiltStates.monthlyPerf.tiltX}deg) rotateY(${tiltStates.monthlyPerf.tiltY}deg) translateZ(40px) scale(1.05)`
                  : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                boxShadow: tiltStates.monthlyPerf.isHovering
                  ? "0 30px 60px rgba(0,0,0,0.15)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center gap-4">
                <Icons.BarChart />
                <div>
                  <p className="text-sm text-gray-600">Monthly Performance</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">87.5%</p>
                  <p className="text-xs text-green-600">↑ 2.3% from last month</p>
                </div>
              </div>
            </div>

            <div
              data-card="upcomingReviews"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transform-gpu transition-all duration-500 ease-out"
              style={{
                transform: tiltStates.upcomingReviews.isHovering
                  ? `perspective(1000px) rotateX(${tiltStates.upcomingReviews.tiltX}deg) rotateY(${tiltStates.upcomingReviews.tiltY}deg) translateZ(40px) scale(1.05)`
                  : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                boxShadow: tiltStates.upcomingReviews.isHovering
                  ? "0 30px 60px rgba(0,0,0,0.15)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center gap-4">
                <Icons.Calendar />
                <div>
                  <p className="text-sm text-gray-600">Upcoming Reviews</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
                  <p className="text-xs text-blue-600">Next: Performance Appraisal Week</p>
                </div>
              </div>
            </div>

            <div
              data-card="teamSatisfaction"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transform-gpu transition-all duration-500 ease-out"
              style={{
                transform: tiltStates.teamSatisfaction.isHovering
                  ? `perspective(1000px) rotateX(${tiltStates.teamSatisfaction.tiltX}deg) rotateY(${tiltStates.teamSatisfaction.tiltY}deg) translateZ(40px) scale(1.05)`
                  : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
                boxShadow: tiltStates.teamSatisfaction.isHovering
                  ? "0 30px 60px rgba(0,0,0,0.15)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center gap-4">
                <Icons.Users />
                <div>
                  <p className="text-sm text-gray-600">Team Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">92%</p>
                  <p className="text-xs text-green-600">Based on Q3 survey</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-lg font-bold text-gray-900">TechMedia TechMaven Portal</p>
                <p className="text-sm text-gray-500 mt-2">
                  Employee Monitoring & Performance Management System • Established 2025
                </p>
              </div>
              <div className="flex gap-6 text-sm text-gray-500">
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Employee Handbook
                </a>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Contact HR
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
              <p>© 2025 TechMedia Corporation. All rights reserved. | Version 2.1.4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles + Font OCR A */}
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
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #c0c0c0;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: white;
        }
      `}</style>
    </>
  );
}