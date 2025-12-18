"use client";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
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

// Daftar sponsor (gunakan path sesuai asset yang Anda siapkan)
const sponsors = [
  { name: "Gemini", logo: "/sponsors/gemini.png" },
  { name: "ChatGPT", logo: "/sponsors/chatgpt.png" },
  { name: "Microsoft", logo: "/sponsors/microsoft.png" },
  { name: "Google Cloud", logo: "/sponsors/google-cloud.png" },
  { name: "AWS", logo: "/sponsors/aws.png" },
  { name: "Slack", logo: "/sponsors/slack.png" },
  { name: "Notion", logo: "/sponsors/notion.png" },
  { name: "Figma", logo: "/sponsors/figma.png" },
  { name: "OpenAI", logo: "/sponsors/openai.png" },
  { name: "GitHub", logo: "/sponsors/github.png" },
  { name: "Vercel", logo: "/sponsors/vercel.png" },
  { name: "Tailwind", logo: "/sponsors/tailwind.png" }
];

// Duplicate sponsors untuk infinite scroll effect
const sponsorRows = [
  [...sponsors, ...sponsors], // Row 1: bergerak ke kanan
  [...sponsors, ...sponsors], // Row 2: bergerak ke kiri
  [...sponsors, ...sponsors]  // Row 3: bergerak ke kanan
];

// Memoized Icon Components
const SunIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
));

const MoonIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
));

// Memoized Theme Toggle Component - SIMPLIFIED version tanpa dropdown
const ThemeToggle = memo(({ 
  theme, 
  toggleTheme
}: { 
  theme: Theme;
  toggleTheme: () => void;
}) => (
  <button 
    className={`fixed top-6 right-6 z-50 px-5 py-2.5 rounded-full backdrop-blur-sm flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-lg ${
      theme.isDayTime
        ? "bg-white/90 text-gray-800 hover:bg-white border border-gray-200"
        : "bg-gray-800/90 text-white hover:bg-gray-700 border border-gray-700"
    }`}
    onClick={toggleTheme}
    aria-label="Toggle theme"
  >
    {theme.isDayTime ? (
      <>
        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
          <SunIcon />
        </div>
        <span className="text-sm font-medium">Day Mode</span>
      </>
    ) : (
      <>
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <MoonIcon />
        </div>
        <span className="text-sm font-medium">Night Mode</span>
      </>
    )}
  </button>
));

// New Header Navigation Component - UPDATED tanpa tombol "Get Started Free"
const HeaderNav = memo(({ 
  themeColors, 
  setIsLoginModalOpen,
  theme 
}: { 
  themeColors: any;
  setIsLoginModalOpen: (open: boolean) => void;
  theme: Theme;
}) => (
  <header className={`sticky top-0 z-40 w-full border-b ${themeColors.border} ${themeColors.bg} backdrop-blur-sm bg-opacity-80`}>
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">TM</span>
          </div>
          <span className={`text-xl font-bold ${themeColors.text}`}>TechMaven</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className={`${themeColors.textLight} hover:text-blue-600 transition-colors font-medium`}>
            Features
          </Link>
          <Link href="#solutions" className={`${themeColors.textLight} hover:text-blue-600 transition-colors font-medium`}>
            Solutions
          </Link>
          <Link href="#pricing" className={`${themeColors.textLight} hover:text-blue-600 transition-colors font-medium`}>
            Pricing
          </Link>
          <Link href="#resources" className={`${themeColors.textLight} hover:text-blue-600 transition-colors font-medium`}>
            Resources
          </Link>
        </nav>

        {/* CTA Button - Hanya Sign In */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${theme.isDayTime ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  </header>
));

// Sponsors Marquee Component dengan animasi horizontal
const SponsorsMarquee = memo(({ theme, themeColors }: { theme: Theme; themeColors: any }) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="py-10 border-y ${themeColors.border} overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h3 className={`text-lg font-semibold ${themeColors.textLight} mb-2`}>
            Trusted by industry leaders
          </h3>
          <p className={`text-sm ${themeColors.textLighter}`}>
            Partnered with the world's most innovative companies
          </p>
        </div>
        
        {/* Row 1 - Bergerak ke kanan */}
        <div 
          className="flex mb-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={`flex space-x-12 ${isPaused ? 'animate-pause' : 'animate-marquee-right'}`}>
            {sponsorRows[0].map((sponsor, index) => (
              <div 
                key={`row1-${index}`}
                className="flex-shrink-0 w-40 h-16 flex items-center justify-center"
              >
                <div className={`relative w-full h-full flex items-center justify-center p-4 rounded-lg transition-all duration-300 ${themeColors.bgLight} hover:scale-105 hover:shadow-md ${isPaused ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={120}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Bergerak ke kiri */}
        <div 
          className="flex mb-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={`flex space-x-12 ${isPaused ? 'animate-pause' : 'animate-marquee-left'}`}>
            {sponsorRows[1].map((sponsor, index) => (
              <div 
                key={`row2-${index}`}
                className="flex-shrink-0 w-40 h-16 flex items-center justify-center"
              >
                <div className={`relative w-full h-full flex items-center justify-center p-4 rounded-lg transition-all duration-300 ${themeColors.bgLight} hover:scale-105 hover:shadow-md ${isPaused ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={120}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 - Bergerak ke kanan */}
        <div 
          className="flex"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={`flex space-x-12 ${isPaused ? 'animate-pause' : 'animate-marquee-right'}`}>
            {sponsorRows[2].map((sponsor, index) => (
              <div 
                key={`row3-${index}`}
                className="flex-shrink-0 w-40 h-16 flex items-center justify-center"
              >
                <div className={`relative w-full h-full flex items-center justify-center p-4 rounded-lg transition-all duration-300 ${themeColors.bgLight} hover:scale-105 hover:shadow-md ${isPaused ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={120}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

// New Hero Section with modern layout
const HeroSection = memo(({ 
  theme, 
  displayedText, 
  themeColors, 
  heroRef, 
  scrollProgress 
}: { 
  theme: Theme;
  displayedText: string;
  themeColors: any;
  heroRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: number;
}) => {
  const heroTextOpacity = Math.max(1 - scrollProgress * 1.5, 0);
  const heroTextTranslateY = scrollProgress * 40;
  
  return (
    <section 
      ref={heroRef}
      className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden"
      style={{
        background: theme.isDayTime 
          ? 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #f0f4ff 100%)'
          : 'linear-gradient(135deg, #0a0f1f 0%, #0d1429 50%, #0c1120 100%)'
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${theme.isDayTime ? 'bg-blue-200/30' : 'bg-blue-900/10'}`}></div>
        <div className={`absolute top-60 -left-20 w-60 h-60 rounded-full ${theme.isDayTime ? 'bg-purple-200/30' : 'bg-blue-800/10'}`}></div>
        <div className={`absolute bottom-20 right-1/4 w-40 h-40 rounded-full ${theme.isDayTime ? 'bg-green-200/20' : 'bg-blue-700/10'}`}></div>
      </div>

      <div className="container relative mx-auto px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div 
            className="transition-all duration-300"
            style={{
              opacity: heroTextOpacity,
              transform: `translateY(${heroTextTranslateY}px)`
            }}
          >
            {/* Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${theme.isDayTime ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/30 text-blue-200'} text-sm font-medium mb-8`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${theme.isDayTime ? 'bg-blue-600' : 'bg-blue-400'}`}></span>
              Trusted by 500+ companies worldwide
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block" style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayedText || "Welcome to TechMaven Portal"}
              </span>
              <span className="block text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-4">
                Employee Monitoring System
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-xl md:text-2xl ${theme.isDayTime ? 'text-gray-600' : 'text-gray-300'} max-w-3xl mx-auto mb-12 leading-relaxed`}>
              A comprehensive platform for tracking employee performance, managing projects, and optimizing team productivity across your organization.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button
                onClick={() => {
                  const event = new CustomEvent('openLoginModal', { detail: 'employee' });
                  window.dispatchEvent(event);
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-1 text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </button>
              <button className={`px-8 py-4 ${theme.isDayTime ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'} rounded-xl border-2 ${theme.isDayTime ? 'border-gray-300 hover:border-blue-500' : 'border-gray-700 hover:border-blue-400'} transition-colors text-lg font-medium flex items-center justify-center gap-3`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Watch Demo Video
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "500+", label: "Companies" },
                { value: "50K+", label: "Users" },
                { value: "24/7", label: "Support" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl font-bold ${theme.isDayTime ? 'text-gray-900' : 'text-white'} mb-2`}>
                    {stat.value}
                  </div>
                  <div className={theme.isDayTime ? 'text-gray-600' : 'text-gray-400'}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// New Features Section with enhanced cards
const FeaturesSection = memo(({ 
  themeColors, 
  handleOpenLoginModal,
  theme
}: { 
  themeColors: any;
  handleOpenLoginModal: (role: 'supervisor' | 'pm' | 'employee') => void;
  theme: Theme;
}) => (
  <section id="features" className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className={themeColors.text}>Built for Every Role in Your</span>
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Organization</span>
        </h2>
        <p className={`text-xl ${themeColors.textLight}`}>
          Tailored solutions for supervisors, project managers, and employees to optimize workflow and productivity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Supervisor Card */}
        <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 hover:transform hover:-translate-y-2 transition-all duration-300`}>
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-6`}>
            SV
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full ${theme.isDayTime ? 'bg-purple-100 text-purple-800' : 'bg-purple-900/30 text-purple-200'} text-xs font-medium mb-4`}>
            Executive Level
          </div>
          <h3 className={`text-2xl font-bold ${themeColors.text} mb-4`}>Supervisor</h3>
          <p className={`${themeColors.textLight} mb-6`}>
            Complete oversight across all departments with advanced analytics and reporting capabilities.
          </p>
          
          <div className="space-y-3 mb-8">
            {[
              "Company-wide performance dashboards",
              "Advanced analytics & forecasting",
              "124+ employees management"
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${theme.isDayTime ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                  <svg className={`w-3 h-3 ${theme.isDayTime ? 'text-purple-600' : 'text-purple-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className={`text-sm ${themeColors.textLight}`}>{feature}</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => handleOpenLoginModal('supervisor')}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium flex items-center justify-center gap-2"
          >
            Login as Supervisor
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </button>
        </div>
        
        {/* PM Card */}
        <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 hover:transform hover:-translate-y-2 transition-all duration-300`}>
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-6`}>
            PM
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full ${theme.isDayTime ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/30 text-blue-200'} text-xs font-medium mb-4`}>
            Management Level
          </div>
          <h3 className={`text-2xl font-bold ${themeColors.text} mb-4`}>Project Manager</h3>
          <p className={`${themeColors.textLight} mb-6`}>
            Streamline project workflows, track team performance, and meet deadlines efficiently.
          </p>
          
          <div className="space-y-3 mb-8">
            {[
              "Department-specific monitoring",
              "Team performance tracking",
              "25 team members capacity"
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${theme.isDayTime ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                  <svg className={`w-3 h-3 ${theme.isDayTime ? 'text-blue-600' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className={`text-sm ${themeColors.textLight}`}>{feature}</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => handleOpenLoginModal('pm')}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2"
          >
            Login as Project Manager
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </button>
        </div>
        
        {/* Employee Card */}
        <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 hover:transform hover:-translate-y-2 transition-all duration-300`}>
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold mb-6`}>
            E
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full ${theme.isDayTime ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-200'} text-xs font-medium mb-4`}>
            Team Member
          </div>
          <h3 className={`text-2xl font-bold ${themeColors.text} mb-4`}>Employee</h3>
          <p className={`${themeColors.textLight} mb-6`}>
            Personal productivity dashboard with task management and performance insights.
          </p>
          
          <div className="space-y-3 mb-8">
            {[
              "Personal dashboard & task management",
              "Time tracking & attendance",
              "Performance review access"
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${theme.isDayTime ? 'bg-green-100' : 'bg-green-900/30'}`}>
                  <svg className={`w-3 h-3 ${theme.isDayTime ? 'text-green-600' : 'text-green-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className={`text-sm ${themeColors.textLight}`}>{feature}</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => handleOpenLoginModal('employee')}
            className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium flex items-center justify-center gap-2"
          >
            Login as Employee
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
));

// New Footer Component
const Footer = memo(({ themeColors }: { themeColors: any }) => (
  <footer className={`${themeColors.bg} border-t ${themeColors.border} py-12`}>
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Company Info */}
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">TM</span>
            </div>
            <span className={`text-xl font-bold ${themeColors.text}`}>TechMaven</span>
          </div>
          <p className={`${themeColors.textLight} text-sm mb-6`}>
            Empowering organizations with intelligent employee monitoring and performance management solutions.
          </p>
          <div className="flex space-x-4">
            <a href="#" className={`w-10 h-10 rounded-full ${themeColors.bgLight} flex items-center justify-center ${themeColors.text} hover:text-blue-600 transition-colors`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className={`w-10 h-10 rounded-full ${themeColors.bgLight} flex items-center justify-center ${themeColors.text} hover:text-blue-600 transition-colors`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 className={`font-bold ${themeColors.text} mb-6`}>Product</h4>
          <ul className="space-y-3">
            <li><a href="#" className={`${themeColors.textLight} hover:text-blue-600 transition-colors text-sm`}>Features</a></li>
            <li><a href="#" className={`${themeColors.textLight} hover:text-blue-600 transition-colors text-sm`}>Pricing</a></li>
            <li><a href="#" className={`${themeColors.textLight} hover:text-blue-600 transition-colors text-sm`}>API</a></li>
            <li><a href="#" className={`${themeColors.textLight} hover:text-blue-600 transition-colors text-sm`}>Documentation</a></li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className={`font-bold ${themeColors.text} mb-6`}>Company</h4>
          <ul className="space-y-3">
            <li><a href="#" className={`${themeColors.textLight} hover:text-blue-600 transition-colors text-sm`}>About</a></li>
            <li><a href="#" className={`${themeColors.textLight} hover:text-blue-600 transition-colors text-sm`}>Careers</a></li>
            <li><a href="#" className={`${themeColors.textLight} hover:text-blue-600 transition-colors text-sm`}>Blog</a></li>
            <li><a href="#" className={`${themeColors.textLight} hover:text-blue-600 transition-colors text-sm`}>Press</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className={`font-bold ${themeColors.text} mb-6`}>Contact</h4>
          <ul className="space-y-3">
            <li className={`${themeColors.textLight} text-sm`}>support@techmaven.com</li>
            <li className={`${themeColors.textLight} text-sm`}>+1 (555) 123-4567</li>
            <li className={`${themeColors.textLight} text-sm`}>123 Tech Street, San Francisco, CA</li>
          </ul>
          <div className="mt-8">
            <p className={`${themeColors.textLight} text-xs`}>© 2024 TechMaven. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
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
    
    // Listen for custom openLoginModal event
    const handleOpenLoginModalEvent = (e: any) => {
      handleOpenLoginModal(e.detail || 'employee');
    };
    
    window.addEventListener('openLoginModal', handleOpenLoginModalEvent);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('openLoginModal', handleOpenLoginModalEvent);
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
    shadow: "shadow-lg shadow-black/30",
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
      <GlobalStyles theme={theme} />
      
      <HeaderNav 
        themeColors={themeColors} 
        setIsLoginModalOpen={setIsLoginModalOpen}
        theme={theme}
      />
      
      {/* Simple Theme Toggle Button */}
      <ThemeToggle 
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <HeroSection 
        theme={theme}
        displayedText={displayedText}
        themeColors={themeColors}
        heroRef={heroRef}
        scrollProgress={scrollProgress}
      />
      
      {/* Sponsors Marquee Section */}
      <SponsorsMarquee theme={theme} themeColors={themeColors} />
      
      <FeaturesSection 
        themeColors={themeColors}
        handleOpenLoginModal={handleOpenLoginModal}
        theme={theme}
      />
      
      {/* Additional Sections can be added here */}
      <section className={`py-20 ${themeColors.bgLight}`}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">
            <span className={themeColors.text}>Ready to transform your</span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">workplace productivity?</span>
          </h2>
          <p className={`text-xl ${themeColors.textLight} max-w-2xl mx-auto mb-12`}>
            Join thousands of companies that trust TechMaven for their employee monitoring and performance management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-1 text-lg font-medium shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial
            </button>
            <button className={`px-8 py-4 ${theme.isDayTime ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'} rounded-xl border-2 ${theme.isDayTime ? 'border-gray-300 hover:border-blue-500' : 'border-gray-700 hover:border-blue-400'} transition-colors text-lg font-medium`}>
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
      
      <Footer themeColors={themeColors} />
      
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
    </>
  );
}

// Memoized Global Styles Component - DITAMBAHKAN ANIMASI MARQUEE
const GlobalStyles = memo(({ theme }: { theme: Theme }) => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    @font-face {
      font-family: 'OCR A';
      src: url('/fonts/OCRA.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    
    html {
      scroll-behavior: smooth;
      font-family: 'Inter', sans-serif;
    }
    
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${theme.isDayTime ? '#f1f1f1' : '#0a0f1f'};
      border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${theme.isDayTime ? '#c0c0c0' : '#1e293b'};
      border-radius: 5px;
      border: 2px solid ${theme.isDayTime ? '#f1f1f1' : '#0a0f1f'};
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.isDayTime ? '#a8a8a8' : '#334155'};
    }
    
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      background-color: ${theme.isDayTime ? 'white' : '#0a0f1f'};
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      transition: background-color 0.3s ease;
    }
    
    /* Marquee Animations */
    @keyframes marquee-right {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
    
    @keyframes marquee-left {
      0% {
        transform: translateX(-50%);
      }
      100% {
        transform: translateX(0);
      }
    }
    
    .animate-marquee-right {
      animation: marquee-right 40s linear infinite;
    }
    
    .animate-marquee-left {
      animation: marquee-left 40s linear infinite;
    }
    
    .animate-pause {
      animation-play-state: paused;
    }
    
    /* Reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      .animate-marquee-right,
      .animate-marquee-left {
        animation: none;
      }
      
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    
    /* Smooth transitions */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
    }
    
    /* Gradient text */
    .text-gradient {
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }
  `}</style>
));