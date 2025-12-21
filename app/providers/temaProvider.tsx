"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Theme {
  isDayTime: boolean;
  backgroundImage: string;
  theme: 'light' | 'dark';
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setDayMode: () => void;
  setNightMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME: Theme = {
  isDayTime: true,
  backgroundImage: "/backgroundDay.jpg",
  theme: 'light'
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // ✅ Initialize with default theme first
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // ✅ Load from localStorage after mount
  useEffect(() => {
    setMounted(true);
    
    try {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        setTheme(parsed);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDayTime = !theme.isDayTime;
    const newTheme: Theme = {
      isDayTime: newIsDayTime,
      backgroundImage: newIsDayTime ? "/backgroundDay.jpg" : "/backgroundNight.jpg",
      theme: newIsDayTime ? 'light' : 'dark'
    };
    setTheme(newTheme);
    if (mounted) {
      localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
    }
  };

  const setDayMode = () => {
    const newTheme: Theme = {
      isDayTime: true,
      backgroundImage: "/backgroundDay.jpg",
      theme: 'light'
    };
    setTheme(newTheme);
    if (mounted) {
      localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
    }
  };

  const setNightMode = () => {
    const newTheme: Theme = {
      isDayTime: false,
      backgroundImage: "/backgroundNight.jpg",
      theme: 'dark'
    };
    setTheme(newTheme);
    if (mounted) {
      localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
    }
  };

  // ✅ Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: DEFAULT_THEME, toggleTheme, setDayMode, setNightMode }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setDayMode, setNightMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}