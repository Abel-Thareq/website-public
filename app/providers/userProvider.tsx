"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { authApi } from '../../lib/api';

interface UserContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (user: User) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
    
    // Set up interval to check auth status every 30 seconds
    // This ensures multi-tab sync - if logout in one tab, other tabs will detect it
    const interval = setInterval(() => {
      checkAuth();
    }, 30000);
    
    // Listen for logout event from other tabs/windows
    const handleLogoutEvent = () => {
      setCurrentUser(null);
    };
    
    window.addEventListener('logout', handleLogoutEvent);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, []);

  // Fungsi untuk verify token dengan backend
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token dengan backend
      const userData = await authApi.me();
      
      // Transform backend user data ke frontend format
      const user: User = {
        id: userData.id.toString(),
        username: userData.username,
        password: '', // Jangan simpan password di frontend
        name: userData.name,
        role: userData.role,
        initials: userData.initials,
        department: userData.department,
        email: userData.email,
        phone: userData.phone || '',
        joinDate: userData.created_at || new Date().toISOString(),
        position: userData.position || userData.role,
        avatar: userData.avatar,
        color: 'from-blue-500 to-blue-600' // Default color
      };

      setCurrentUser(user);
      // Store in both sessionStorage and localStorage
      // sessionStorage is per-tab, localStorage is global fallback
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // Token invalid, clear storage
      if (error.response?.status === 401) {
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(username, password);
      
      if (response.token && response.user) {
        // Save token - using localStorage so it persists across tabs
        localStorage.setItem('auth_token', response.token);
        
        // Transform and save user
        const user: User = {
          id: response.user.id.toString(),
          username: response.user.username,
          password: '', 
          name: response.user.name,
          role: response.user.role,
          initials: response.user.initials,
          department: response.user.department,
          email: response.user.email,
          phone: response.user.phone || '',
          joinDate: response.user.created_at || new Date().toISOString(),
          position: response.user.position || response.user.role,
          avatar: response.user.avatar,
          color: 'from-blue-500 to-blue-600'
        };
        
        // Store in both storages
        localStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show error message to user
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.response?.status === 401) {
        alert('Invalid username or password');
      } else {
        alert('Login failed. Please try again.');
      }
      
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage FIRST
      setCurrentUser(null);
      
      if (mounted && typeof window !== 'undefined') {
        // Clear ALL auth-related storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('auth_token');
        
        // Dispatch custom event to notify other components and tabs
        window.dispatchEvent(new CustomEvent('logout'));
        // Also dispatch on storage event for cross-tab communication
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'auth_token',
          oldValue: null,
          newValue: null,
          storageArea: localStorage,
        }));
        
        // Small delay to ensure state updates propagate
        setTimeout(() => {
          // Use hard redirect to completely clear the page state
          window.location.href = '/';
        }, 50);
      }
    }
  };

  // Switch user - untuk demo/testing purposes
  // ⚠️ CATATAN: Ini tidak aman untuk production! 
  // Seharusnya user harus logout dan login ulang dengan credentials yang berbeda
  const switchUser = async (user: User) => {
    try {
      // Option 1: Logout current user dan redirect ke login
      // await logout();
      // window.location.href = '/';
      
      // Option 2: Force switch (ONLY for demo/development)
      setCurrentUser(user);
      if (mounted) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      // Refresh page to reload all data
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Switch user error:', error);
    }
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    await checkAuth();
  };

  // Prevent rendering until mounted (avoid hydration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      switchUser, 
      loading,
      refreshUser 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}