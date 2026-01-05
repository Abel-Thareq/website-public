"use client";

import { useState, useEffect } from 'react';
import { pendingRegistrationApi } from '../../lib/api';

// --- ICONS (Inline SVG untuk menghindari dependensi eksternal) ---
const IconUser = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconBriefcase = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const IconChevronRight = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconArrowLeft = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconEye = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconEyeOff = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme: any;
}

export default function RegistrationModal({ isOpen, onClose, onSuccess, theme }: RegistrationModalProps) {
  const [step, setStep] = useState(1); // 1: Account Info, 2: Personal & Role
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'employee',
    department: '',
    phone: '',
    position: '',
  });
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      setSuccessMsg('');
      setFormData(prev => ({ ...prev, role: 'employee' }));
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0-4
  };

  const validateStep1 = () => {
    if (!formData.username.trim()) return setError('Username is required');
    if (!formData.email.trim() || !formData.email.includes('@')) return setError('Valid email is required');
    if (formData.password.length < 8) return setError('Password must be at least 8 chars');
    if (formData.password !== formData.password_confirmation) return setError('Passwords do not match');
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError('Full Name is required');
    
    setIsLoading(true);
    setError('');

    try {
      await pendingRegistrationApi.register({
        ...formData,
        role: formData.role as 'pm' | 'employee'
      });

      setSuccessMsg('Registration submitted! Waiting for approval.');
      setTimeout(() => {
        onClose();
        onSuccess();
        // Reset form
        setFormData({
            name: '', username: '', email: '', password: '', password_confirmation: '',
            role: 'employee', department: '', phone: '', position: '',
        });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDark = !theme.isDayTime;
  const passStrength = calculatePasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>

      {/* Modal Card */}
      <div className={`
        relative w-full max-w-5xl h-auto md:h-[650px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-up
        ${isDark ? 'bg-[#0F0F0F] border border-white/10' : 'bg-white border border-gray-200'}
      `}>
        
        {/* LEFT SIDE: Visuals & Progress */}
        <div className="w-full md:w-2/5 relative overflow-hidden bg-indigo-900 flex flex-col justify-between p-8 md:p-12">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-900"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 animate-spin-slow"></div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full border-[20px] border-white/10 blur-sm"></div>
            <div className="absolute top-20 -left-20 w-40 h-40 rounded-full bg-pink-500/20 blur-2xl"></div>

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                        <span className="text-xl">🚀</span>
                    </div>
                    <span className="text-white font-bold tracking-wide text-lg">TechMaven</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                    Join the <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-200">Future Workforce</span>
                </h2>
                <p className="text-indigo-100 text-sm leading-relaxed opacity-80">
                    Create your account to access real-time analytics, smart scheduling, and seamless team collaboration.
                </p>
            </div>

            {/* Step Indicator */}
            <div className="relative z-10 mt-8 md:mt-0">
                <div className="flex items-center gap-4 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${step >= 1 ? 'bg-white text-indigo-900 border-white' : 'bg-transparent text-white/50 border-white/30'}`}>1</div>
                    <div className={`h-[2px] flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-white' : 'bg-white/20'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${step >= 2 ? 'bg-white text-indigo-900 border-white' : 'bg-transparent text-white/50 border-white/30'}`}>2</div>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-indigo-200 font-bold">
                    <span>Credentials</span>
                    <span>Profile Info</span>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className={`w-full md:w-3/5 p-8 md:p-12 relative flex flex-col ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1">{step === 1 ? 'Setup Account' : 'Complete Profile'}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}</p>
                </div>

                {/* Error/Success Messages */}
                {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold animate-pulse">{error}</div>}
                {successMsg && <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-xs font-bold">{successMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* --- STEP 1: CREDENTIALS --- */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Username</label>
                                <input 
                                    type="text" name="username" value={formData.username} onChange={handleInputChange}
                                    className={`w-full p-3 rounded-xl outline-none border-2 focus:border-indigo-500 transition-all bg-transparent font-medium ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                    placeholder="johndoe"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
                                <input 
                                    type="email" name="email" value={formData.email} onChange={handleInputChange}
                                    className={`w-full p-3 rounded-xl outline-none border-2 focus:border-indigo-500 transition-all bg-transparent font-medium ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                    placeholder="john@example.com"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            name="password" value={formData.password} onChange={handleInputChange}
                                            className={`w-full p-3 rounded-xl outline-none border-2 focus:border-indigo-500 transition-all bg-transparent font-medium pr-10 ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500">
                                            {showPassword ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                    {/* Strength Meter */}
                                    <div className="flex gap-1 mt-2 h-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < passStrength ? strengthColors[passStrength] : 'bg-gray-200/20'}`}></div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Confirm</label>
                                    <input 
                                        type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange}
                                        className={`w-full p-3 rounded-xl outline-none border-2 focus:border-indigo-500 transition-all bg-transparent font-medium ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button type="button" onClick={validateStep1} className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2">
                                Next Step <IconChevronRight />
                            </button>
                        </div>
                    )}

                    {/* --- STEP 2: PROFILE & ROLE --- */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in-up">
                            {/* Role Cards */}
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                {[
                                    { id: 'employee', label: 'Employee', desc: 'Standard Access', icon: <IconUser /> },
                                    { id: 'pm', label: 'Manager', desc: 'Team Lead', icon: <IconBriefcase /> }
                                ].map((role) => (
                                    <div 
                                        key={role.id}
                                        onClick={() => setFormData({...formData, role: role.id})}
                                        className={`
                                            cursor-pointer rounded-xl p-3 border-2 flex flex-col items-center justify-center text-center transition-all duration-200
                                            ${formData.role === role.id 
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' 
                                                : isDark ? 'border-white/10 hover:border-white/30 text-gray-400' : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                            }
                                        `}
                                    >
                                        <div className="mb-1">{role.icon}</div>
                                        <span className="text-xs font-bold uppercase">{role.label}</span>
                                        <span className="text-[9px] opacity-70">{role.desc}</span>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                                <input 
                                    type="text" name="name" value={formData.name} onChange={handleInputChange}
                                    className={`w-full p-3 rounded-xl outline-none border-2 focus:border-indigo-500 transition-all bg-transparent font-medium ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Phone</label>
                                    <input 
                                        type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                        className={`w-full p-3 rounded-xl outline-none border-2 focus:border-indigo-500 transition-all bg-transparent font-medium ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                        placeholder="+62..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Department</label>
                                    <input 
                                        type="text" name="department" value={formData.department} onChange={handleInputChange}
                                        className={`w-full p-3 rounded-xl outline-none border-2 focus:border-indigo-500 transition-all bg-transparent font-medium ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                        placeholder="IT / HR"
                                    />
                                </div>
                            </div>
                            
                             <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Position</label>
                                <input 
                                    type="text" name="position" value={formData.position} onChange={handleInputChange}
                                    className={`w-full p-3 rounded-xl outline-none border-2 focus:border-indigo-500 transition-all bg-transparent font-medium ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                    placeholder="Frontend Developer"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(1)} className={`px-4 py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <IconArrowLeft />
                                </button>
                                <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20">
                                    {isLoading ? 'Processing...' : 'Complete Registration'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
                
                <p className="text-center text-[10px] text-gray-500 mt-6 uppercase tracking-widest">
                    Already have an account? <span onClick={onClose} className="text-indigo-500 font-bold cursor-pointer hover:underline">Sign In</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}