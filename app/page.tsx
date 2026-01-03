"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { User } from "./types/user";
import { useUser } from './providers/userProvider';

// ==========================================
// 1. TYPE DEFINITIONS & DATA
// ==========================================

interface Theme {
  isDayTime: boolean;
  backgroundImage?: string;
  theme: 'light' | 'dark';
}

const availableUsers: User[] = [
  { 
    id: "supervisor_001", 
    username: "supervisor", 
    password: "supervisor123", 
    name: "Alex Johnson", 
    role: "supervisor", 
    initials: "AJ", 
    department: "Executive", 
    employeeCount: 124, 
    color: "from-blue-700 to-blue-900", 
    email: "alex@simkar.id", 
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
    color: "from-blue-600 to-blue-800", 
    email: "sarah@simkar.id", 
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
    color: "from-blue-500 to-blue-700", 
    email: "john@simkar.id", 
    phone: "+62-812-555-0123", 
    joinDate: "2023-06-10" 
  }
];

const featuresData = [
  {
    title: "Attendance Management",
    desc: "Sistem pencatatan kehadiran digital (Check-in/Out) dengan validasi lokasi, upload dokumentasi foto, perhitungan jam kerja otomatis, serta status real-time (On-time, Late, Absent).",
    icon: "📍",
    grid: "md:col-span-2 md:row-span-2"
  },
  {
    title: "Task Management",
    desc: "Pembuatan dan pendelegasian tugas ke karyawan, dilengkapi subtask, kolom komentar, pelacakan progres (To-Do, In Progress, Done), dan monitoring deadline.",
    icon: "📋",
    grid: "md:col-span-1 md:row-span-1"
  },
  {
    title: "Work Hours Management",
    desc: "Pengaturan shift dan jam kerja fleksibel oleh supervisor dengan sinkronisasi real-time ke seluruh perangkat user.",
    icon: "⏰",
    grid: "md:col-span-1 md:row-span-1"
  },
  {
    title: "Reporting & Analytics",
    desc: "Dashboard eksekutif yang menyajikan laporan kehadiran, statistik penyelesaian task, dan analisis produktivitas karyawan yang dapat diekspor.",
    icon: "📊",
    grid: "md:col-span-2 md:row-span-1"
  },
  {
    title: "Role-based Access",
    desc: "Keamanan data bertingkat. Supervisor (Full Access), Project Manager (Team & Task), dan Employee (Personal) melihat data sesuai kewenangan.",
    icon: "🔐",
    grid: "md:col-span-2 md:row-span-1"
  }
];

const portfolioData = [
  {
    id: 1,
    title: "E-Gov Smart City",
    category: "Government",
    year: "2023",
    desc: "Sistem integrasi data kependudukan dan layanan publik untuk pemerintah kota, mengurangi waktu administrasi hingga 40% dengan implementasi Big Data Analytics."
  },
  {
    id: 2,
    title: "FinTech Dashboard",
    category: "Finance",
    year: "2023",
    desc: "Platform manajemen aset dan pelaporan keuangan real-time untuk perusahaan investasi, dilengkapi dengan fitur keamanan enkripsi tingkat bank dan visualisasi data interaktif."
  },
  {
    id: 3,
    title: "EduTech Learning",
    category: "Education",
    year: "2022",
    desc: "Learning Management System (LMS) berbasis gamifikasi untuk meningkatkan engagement siswa, mendukung kelas virtual, kuis interaktif, dan tracking progres belajar."
  },
  {
    id: 4,
    title: "HealthCare Monitor",
    category: "Health",
    year: "2024",
    desc: "Aplikasi monitoring pasien rawat jalan dengan integrasi IoT wearables, memberikan notifikasi real-time kepada dokter terkait anomali tanda vital pasien."
  }
];

// ==========================================
// 2. 3D ASSETS (PURE SVG)
// ==========================================

const AssetRing = memo(({ className }: { className?: string }) => (
  <div className={`relative ${className} pointer-events-none z-0 will-change-transform`}>
    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl animate-float-slow">
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d="M200,50 A150,150 0 1,1 200,350 A150,150 0 1,1 200,50 M200,80 A120,120 0 1,0 200,320 A120,120 0 1,0 200,80" fill="url(#ringGradient)" className="animate-spin-slow origin-center" />
    </svg>
  </div>
));

const AssetCube = memo(({ className }: { className?: string }) => (
  <div className={`relative ${className} pointer-events-none z-0 will-change-transform`}>
    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl animate-float-fast">
      <defs>
        <linearGradient id="cubeGradTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="cubeGradSide" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
      </defs>
      <path d="M150,50 L250,100 L150,150 L50,100 Z" fill="url(#cubeGradTop)" stroke="white" strokeWidth="0.5"/>
      <path d="M250,100 L250,220 L150,270 L150,150 Z" fill="#2563eb" opacity="0.9"/>
      <path d="M50,100 L150,150 L150,270 L50,220 Z" fill="url(#cubeGradSide)" />
    </svg>
  </div>
));

const AssetCone = memo(({ className }: { className?: string }) => (
  <div className={`relative ${className} pointer-events-none z-0 will-change-transform`}>
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl animate-float-medium">
      <defs>
        <linearGradient id="coneGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <path d="M100,20 L160,180 L40,180 Z" fill="url(#coneGrad)" className="origin-center rotate-12" />
      <ellipse cx="100" cy="180" rx="60" ry="20" fill="#172554" />
    </svg>
  </div>
));

const AssetGrid = memo(({ className }: { className?: string }) => (
  <div className={`relative ${className} pointer-events-none z-0 will-change-transform`}>
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-20">
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-500" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <circle cx="200" cy="150" r="100" fill="url(#radialGlow)" />
      <defs>
        <radialGradient id="radialGlow">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  </div>
));

// ==========================================
// 3. UI PRIMITIVES & ANIMATION
// ==========================================

const ScrollAnimation = ({ children, className = "", delay = 0 }: any) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform will-change-transform ${className} ${
        isVisible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-12 blur-sm"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const GlassCard = ({ children, className = "", onClick }: any) => (
  <div 
    onClick={onClick}
    className={`
      relative backdrop-blur-lg border border-white/10 shadow-2xl overflow-hidden
      bg-gradient-to-b from-white/5 to-white/[0.02] dark:from-white/[0.05] dark:to-transparent
      transition-all duration-300 hover:border-blue-500/40 hover:shadow-blue-500/10 hover:-translate-y-1
      will-change-transform
      ${className}
    `}
  >
    {children}
  </div>
);

const SectionBadge = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm mb-8 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
    </span>
    <span className="text-[10px] font-bold tracking-[0.25em] text-blue-400 uppercase">{text}</span>
  </div>
);

const SectionHeading = ({ title, subtitle, theme }: { title: string, subtitle: string, theme: Theme }) => (
  <ScrollAnimation className="mb-16 text-center md:text-left">
    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-500"></div>
      <span className="text-blue-500 font-mono text-xs tracking-widest uppercase font-bold">{subtitle}</span>
      <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-blue-500 md:hidden"></div>
    </div>
    <h2 className={`text-4xl md:text-6xl font-black tracking-tighter leading-tight ${theme.isDayTime ? 'text-gray-900' : 'text-white'}`}>
      {title}
    </h2>
  </ScrollAnimation>
);

// ==========================================
// 4. COMPLEX VIEW COMPONENTS (SECTIONS)
// ==========================================

// --- HERO / OVERVIEW ---
const OverviewView = memo(({ theme, displayedText, heroRef }: any) => {
  const isDark = !theme.isDayTime;
  
  return (
    <section 
      id="overview"
      ref={heroRef} 
      // FIX: Padding bottom diperbesar agar icon explore tidak ketabrak
      className={`relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden px-4 pt-32 pb-40 ${isDark ? 'bg-[#050505]' : 'bg-[#F8FAFC]'}`}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse-slow will-change-transform"></div>
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${isDark ? 'bg-[url("https://grainy-gradients.vercel.app/noise.svg")]' : ''}`}></div>

      <div className="absolute top-[15%] left-[5%] xl:left-[10%] w-32 h-32 md:w-56 md:h-56 z-0 hidden lg:block opacity-80 pointer-events-none"><AssetRing /></div>
      <div className="absolute bottom-[15%] right-[5%] xl:right-[10%] w-24 h-48 z-0 hidden lg:block opacity-70 pointer-events-none"><AssetCube /></div>
      <div className="absolute top-[20%] right-[15%] w-16 h-16 z-0 hidden lg:block opacity-50 pointer-events-none"><AssetCone /></div>

      <div className="container relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        <ScrollAnimation delay={0} className="mb-6"><SectionBadge text="SYSTEM INFORMATION V1.0" /></ScrollAnimation>

        <ScrollAnimation delay={100}>
          <h1 className={`text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-8 ${isDark ? 'text-white' : 'text-gray-900'} drop-shadow-2xl`}>
            TechMaven <br />
            {/* FIX: Gradasi text diperbaiki agar terbaca di mode terang */}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-blue-500 via-blue-400 to-white' : 'from-blue-700 via-blue-600 to-blue-900'}`}>
              INTELLIGENCE
            </span>
          </h1>
        </ScrollAnimation>

        <ScrollAnimation delay={200} className="h-12 mb-8 flex items-center justify-center">
           {/* FIX: Hapus efek kedip (border-r-2 dan animate-blink) */}
           <div className={`inline-flex items-center text-lg md:text-2xl font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
             {displayedText}
           </div>
        </ScrollAnimation>

        <ScrollAnimation delay={300}>
          <p className={`max-w-2xl mx-auto text-base md:text-lg mb-12 leading-relaxed font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistem Informasi Manajemen Kehadiran dan Pelaporan Kerja berbasis <strong className="text-blue-500 font-bold">Metode Waterfall</strong>. Solusi terintegrasi untuk efisiensi organisasi.
          </p>
        </ScrollAnimation>

        <ScrollAnimation delay={400} className="flex flex-col md:flex-row items-center justify-center gap-5 w-full">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openLoginModal', { detail: 'employee' }))}
            className="group relative w-full md:w-auto px-10 py-4 bg-white text-black rounded-2xl font-bold text-sm tracking-wide hover:scale-105 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">LAUNCH DASHBOARD 🚀</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
          
          <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-md w-full md:w-auto transition-colors ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-white/50 hover:bg-white/80'}`}>
             <div className="flex -space-x-3">
               {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg"></div>)}
             </div>
             <div className="text-left flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Access Level</p>
               <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>Supervisor, PM, Employee</p>
             </div>
          </div>
        </ScrollAnimation>
      </div>

      {/* FIX: Icon Explore diturunkan sedikit (bottom-6) */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce cursor-pointer hover:opacity-100 transition-opacity"
        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Explore</span>
        <div className={`w-[1px] h-10 ${isDark ? 'bg-gradient-to-b from-white to-transparent' : 'bg-gradient-to-b from-black to-transparent'}`}></div>
      </div>
    </section>
  );
});

// --- FEATURES SECTION ---
const FeaturesView = memo(({ theme }: any) => {
  const isDark = !theme.isDayTime;

  return (
    <section id="features" className="min-h-screen py-32 px-4 max-w-7xl mx-auto">
      <SectionHeading theme={theme} subtitle="SYSTEM CAPABILITIES" title="Fitur Unggulan" />
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 auto-rows-[minmax(200px, auto)]">
        {featuresData.map((feature, index) => (
          <ScrollAnimation key={index} delay={index * 100} className={`${feature.grid} h-full`}>
            <GlassCard className="rounded-3xl p-8 h-full flex flex-col justify-between group hover:border-blue-500 transition-colors">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-3xl shadow-inner border border-blue-500/20">{feature.icon}</div>
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
              </div>
            </GlassCard>
          </ScrollAnimation>
        ))}
      </div>
    </section>
  );
});

// --- PORTFOLIO SECTION (Interactive) ---
const PortfolioView = memo(({ theme }: any) => {
  const isDark = !theme.isDayTime;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section id="portfolio" className={`min-h-screen py-32 px-4 ${isDark ? 'bg-[#050505]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading theme={theme} subtitle="OUR WORK" title="Portfolio Project" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioData.map((project, index) => (
            <ScrollAnimation key={project.id} delay={index * 150} className="h-full">
              <div 
                onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                className={`
                  group cursor-pointer relative rounded-3xl p-8 border transition-all duration-500 ease-in-out overflow-hidden
                  ${isDark ? 'bg-black border-white/10 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-300 shadow-lg'}
                  ${expandedId === project.id ? 'row-span-2 shadow-blue-500/20' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full border border-blue-500/30 text-blue-500 text-[10px] font-bold uppercase tracking-wider">{project.category}</span>
                  <span className="text-xs font-mono text-gray-500">{project.year}</span>
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 transition-colors group-hover:text-blue-500 ${isDark ? 'text-white' : 'text-black'}`}>{project.title}</h3>
                
                {/* Animasi Expand Deskripsi */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedId === project.id ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{project.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-blue-500 font-bold text-xs cursor-pointer hover:underline">
                    VIEW CASE STUDY ↗
                  </div>
                </div>

                {expandedId !== project.id && (
                  <p className="text-xs text-gray-500 mt-2 italic opacity-0 group-hover:opacity-100 transition-opacity">Click to expand details</p>
                )}
                
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
});

// --- CONTACT US SECTION ---
const ContactView = memo(({ theme }: any) => {
  const isDark = !theme.isDayTime;

  return (
    <section id="contact" className="min-h-screen py-32 px-4 max-w-7xl mx-auto flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeading theme={theme} subtitle="GET IN TOUCH" title="Let's Collaborate" />
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Siap untuk meningkatkan efisiensi perusahaan Anda dengan SIMKAR? Hubungi tim kami untuk demo eksklusif.
          </p>
          <div className="space-y-6">
            {[
              { label: "Email", val: "hello@simkar.id", icon: "📧" },
              { label: "Phone", val: "+62 812 3456 7890", icon: "📞" },
              { label: "Office", val: "Jakarta Selatan, Indonesia", icon: "🏢" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-xl">{item.icon}</div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">{item.label}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GlassCard className="p-8 md:p-12 rounded-3xl">
          <form className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                 <input type="text" className={`w-full p-4 rounded-xl outline-none border-2 focus:border-blue-500 transition-all bg-transparent ${isDark ? 'border-white/10 text-white' : 'border-gray-200 text-black'}`} placeholder="John Doe" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                 <input type="email" className={`w-full p-4 rounded-xl outline-none border-2 focus:border-blue-500 transition-all bg-transparent ${isDark ? 'border-white/10 text-white' : 'border-gray-200 text-black'}`} placeholder="john@company.com" />
               </div>
             </div>
             <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase">Message</label>
                 <textarea rows={4} className={`w-full p-4 rounded-xl outline-none border-2 focus:border-blue-500 transition-all bg-transparent ${isDark ? 'border-white/10 text-white' : 'border-gray-200 text-black'}`} placeholder="Tell us about your needs..." />
             </div>
             <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg">SEND MESSAGE</button>
          </form>
        </GlassCard>
      </div>
    </section>
  );
});

// ==========================================
// 5. GLOBAL HEADER (SCROLL SPY & NAV)
// ==========================================

const HeaderNav = memo(({ themeColors, setIsLoginModalOpen, theme, toggleTheme }: any) => {
  const [activeSection, setActiveSection] = useState('overview');
  const isDark = !theme.isDayTime;

  // Active Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'features', 'portfolio', 'contact'];
      const scrollPosition = window.scrollY + 200; // Offset

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500`}>
      <div className={`
        flex items-center justify-between px-6 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl w-full max-w-6xl transition-all duration-500
        ${isDark ? 'bg-black/90 border-white/5' : 'bg-white/90 border-gray-200'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollToSection('overview')}>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
             {/* FIX: Object fit agar tidak tercrop */}
             <Image src="/TechMaven.png" alt="Logo" fill className="object-contain p-1" />
          </div>
          <div className="flex flex-col">
            <span className={`font-bold tracking-tight text-lg leading-none ${themeColors.text}`}>SIMKAR</span>
            <span className="text-[9px] text-blue-500 font-bold tracking-widest uppercase">Waterfall v1.0</span>
          </div>
        </div>

        {/* Nav Pills */}
        <nav className={`hidden md:flex items-center p-1.5 rounded-xl border border-transparent ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100'}`}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'features', label: 'Features' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'contact', label: 'Contact Us' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                activeSection === item.id 
                  ? isDark ? 'bg-[#333] text-white shadow-md scale-105' : 'bg-white text-black shadow-sm scale-105' 
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
          >
            {theme.isDayTime ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
          >
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
});

// ==========================================
// 6. GLOBAL FOOTER & MODAL
// ==========================================

const Footer = memo(({ theme }: any) => {
  const isDark = !theme.isDayTime;
  return (
    <footer className={`py-12 px-6 border-t ${isDark ? 'bg-black border-white/10 text-white' : 'bg-white border-gray-200 text-black'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/20 shadow-md grayscale hover:grayscale-0 transition-all">
             <Image src="/TechMaven.png" alt="Footer Logo" fill className="object-contain p-1" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-lg">SIMKAR</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Built with Waterfall</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">© 2024 TechMaven. All Requirements Met.</p>
      </div>
    </footer>
  );
});

const LoginModal = ({ isOpen, onClose, selectedRole, onFastLogin, loginError, credentials, setCredentials, handleLogin, isLoggingIn, theme }: any) => {
  if (!isOpen) return null;
  const isDark = !theme.isDayTime;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      <div className={`relative w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl overflow-hidden flex animate-scale-up ${isDark ? 'bg-[#0F0F0F] border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className="hidden md:flex w-1/2 bg-blue-600 relative items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900"></div>
          <AssetRing className="w-64 h-64 opacity-50 text-white" />
          <div className="relative z-10 text-center p-8 text-white">
            <h3 className="text-3xl font-black mb-2">SIMKAR</h3>
            <p className="text-blue-100 text-sm">Secure Gateway Access</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-red-500 transition-colors">✕</button>
          
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRole ? `Login: ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}` : 'Welcome Back'}</h2>
            <p className="text-xs text-gray-500">Enter your credentials to access the system.</p>
          </div>

          {loginError && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg flex items-center gap-2">⚠️ {loginError}</div>}

          <div className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-bold text-blue-500 tracking-wider uppercase mb-1 block">Username</label>
              <input type="text" value={credentials.username} onChange={e => setCredentials({...credentials, username: e.target.value})} className={`w-full p-4 rounded-xl outline-none border-2 focus:border-blue-500 transition-all font-medium text-sm ${isDark ? 'bg-black border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`} placeholder="Ex: supervisor" />
            </div>
            <div className="group">
              <label className="text-[10px] font-bold text-blue-500 tracking-wider uppercase mb-1 block">Password</label>
              <input type="password" value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})} className={`w-full p-4 rounded-xl outline-none border-2 focus:border-blue-500 transition-all font-medium text-sm ${isDark ? 'bg-black border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`} placeholder="••••••••" />
            </div>
            <button onClick={handleLogin} disabled={isLoggingIn} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 text-sm tracking-wide">{isLoggingIn ? 'Authenticating...' : 'SECURE LOGIN'}</button>
          </div>

          <div className="mt-8 pt-6 border-t border-dashed border-gray-700/20">
            <p className="text-[10px] text-center text-gray-500 mb-4 uppercase tracking-widest">Developer Quick Access</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {availableUsers.map(u => (
                <button key={u.id} onClick={() => onFastLogin(u)} className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors uppercase ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-600'}`}>{u.role}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. GLOBAL STYLES COMPONENT
// ==========================================

const GlobalStyles = memo(({ theme }: { theme: Theme }) => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
    
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* Animations */
    @keyframes float-slow { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
    @keyframes float-medium { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-5deg); } }
    @keyframes float-fast { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulse-slow { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.5; } }

    .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
    .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
    .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
    .animate-spin-slow { animation: spin-slow 20s linear infinite; }
    .animate-blink { animation: blink 1s step-end infinite; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
    .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
    .will-change-transform { will-change: transform, opacity; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${theme.isDayTime ? '#f1f5f9' : '#050505'}; }
    ::-webkit-scrollbar-thumb { background: #2563EB; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #1d4ed8; }
  `}</style>
));

// ==========================================
// 8. MAIN PAGE CONTROLLER
// ==========================================

export default function LandingPage() {
  const { login } = useUser();
  const [theme, setTheme] = useState<Theme>({ isDayTime: false, backgroundImage: "", theme: 'dark' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Login State
  const [selectedRole, setSelectedRole] = useState<'supervisor' | 'pm' | 'employee' | null>(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Typing Effect
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  const greetingTexts = ["Analisis Kebutuhan", "Manajemen Kehadiran", "Pelaporan Kerja"];
  const heroRef = useRef(null);

  // Typing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = greetingTexts[loopIndex % greetingTexts.length];
      if (!isDeleting) {
        setDisplayedText(current.substring(0, displayedText.length + 1));
        if (displayedText === current) { setTimeout(() => setIsDeleting(true), 2000); }
      } else {
        setDisplayedText(current.substring(0, displayedText.length - 1));
        if (displayedText === "") { setIsDeleting(false); setLoopIndex(i => i + 1); }
      }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, loopIndex]);

  // Event Listeners
  useEffect(() => {
    const handleLoginEvent = (e: any) => {
      setSelectedRole(e.detail || null);
      setIsLoginModalOpen(true);
    };
    window.addEventListener('openLoginModal', handleLoginEvent);
    return () => window.removeEventListener('openLoginModal', handleLoginEvent);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => ({ ...prev, isDayTime: !prev.isDayTime, theme: !prev.isDayTime ? 'light' : 'dark' }));
  }, []);

  const handleLoginAction = async () => {
    setLoginError(''); setIsLoggingIn(true);
    try {
      const success = await login(credentials.username, credentials.password);
      if (success) { setIsLoginModalOpen(false); window.location.href = '/dashboard'; }
      else { setLoginError('Invalid credentials'); }
    } catch (e) { setLoginError('Login error'); }
    setIsLoggingIn(false);
  };

  const handleFastAccessLogin = (user: User) => {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = '/dashboard';
  };

  const themeColors = theme.isDayTime ? { text: "text-black" } : { text: "text-white" };

  return (
    <div className={`min-h-screen font-sans ${theme.isDayTime ? 'bg-gray-50 text-gray-900' : 'bg-[#050505] text-white'} transition-colors duration-500 selection:bg-blue-500 selection:text-white`}>
      <GlobalStyles theme={theme} />
      
      {/* HEADER NAV BERFUNGSI SEBAGAI SCROLL ANCHOR */}
      <HeaderNav 
        theme={theme} 
        toggleTheme={toggleTheme} 
        setIsLoginModalOpen={() => { setSelectedRole(null); setIsLoginModalOpen(true); }} 
        themeColors={themeColors} 
      />

      {/* SINGLE SCROLLABLE PAGE (ALL SECTIONS) */}
      <main className="w-full">
        <OverviewView theme={theme} displayedText={displayedText} heroRef={heroRef} />
        <FeaturesView theme={theme} />
        <PortfolioView theme={theme} />
        <ContactView theme={theme} />
      </main>
      
      <Footer theme={theme} />

      {/* GLOBAL LOGIN MODAL */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        selectedRole={selectedRole}
        onFastLogin={handleFastAccessLogin}
        loginError={loginError}
        credentials={credentials}
        setCredentials={setCredentials}
        handleLogin={handleLoginAction}
        isLoggingIn={isLoggingIn}
        theme={theme}
      />
    </div>
  );
}