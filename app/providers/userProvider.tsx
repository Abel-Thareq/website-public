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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user is logged in
    try {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('currentUser');

      if (token && savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(username, password);
      
      if (response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        setCurrentUser(response.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      if (mounted) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth_token');
      }
    }
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    if (mounted) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, switchUser, loading }}>
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