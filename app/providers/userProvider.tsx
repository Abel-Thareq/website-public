"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/user';

interface UserContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  switchUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Data user yang ada di sistem
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

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = availableUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword as User);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Force reload to reset all states
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, switchUser }}>
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