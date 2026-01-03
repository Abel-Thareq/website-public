'use client';

import { useState } from 'react';
import { pendingRegistrationApi } from '../../lib/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme: any;
}

export default function RegistrationModal({ isOpen, onClose, onSuccess, theme }: RegistrationModalProps) {
  const [role, setRole] = useState<'pm' | 'employee'>('employee');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '',
    phone: '',
    position: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await pendingRegistrationApi.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role,
        department: formData.department || null,
        phone: formData.phone || null,
        position: formData.position || null,
      });

      setSuccess('Registration submitted successfully! Please wait for supervisor approval.');
      
      // Reset form
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        department: '',
        phone: '',
        position: '',
      });
      setRole('employee');

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDarkMode = !theme.isDayTime;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20 backdrop-blur-xl`}>
        {/* Header */}
        <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b p-6 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create Account
          </h2>
          <button
            onClick={onClose}
            className={`text-2xl font-bold ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Role Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'employee'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                    : isDarkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    : 'border-gray-300 bg-gray-100 text-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">👤</div>
                <div className="font-semibold">Employee</div>
                <div className="text-xs mt-1 opacity-75">Regular employee</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('pm')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'pm'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                    : isDarkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    : 'border-gray-300 bg-gray-100 text-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">👔</div>
                <div className="font-semibold">Project Manager</div>
                <div className="text-xs mt-1 opacity-75">Manage team & tasks</div>
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500 text-green-600">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 focus:border-transparent`}
                placeholder="John Doe"
              />
            </div>

            {/* Username */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 focus:border-transparent`}
                placeholder="johndoe"
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 focus:border-transparent`}
                placeholder="john@example.com"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20 focus:border-transparent`}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20 focus:border-transparent`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 focus:border-transparent`}
                placeholder="Engineering"
              />
            </div>

            {/* Position */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 focus:border-transparent`}
                placeholder="Software Engineer"
              />
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 focus:border-transparent`}
                placeholder="+62812345678"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : role === 'pm'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onClose}
                className="text-blue-500 hover:text-blue-600 font-semibold"
              >
                Login here
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
