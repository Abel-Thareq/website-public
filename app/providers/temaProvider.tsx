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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme) {
        try {
          return JSON.parse(savedTheme);
        } catch (error) {
          console.error('Error parsing saved theme:', error);
        }
      }
    }
    return {
      isDayTime: true,
      backgroundImage: "/backgroundDay.jpg",
      theme: 'light' as const
    };
  });

  const toggleTheme = () => {
    const newIsDayTime = !theme.isDayTime;
    const newTheme = {
      isDayTime: newIsDayTime,
      backgroundImage: newIsDayTime ? "/backgroundDay.jpg" : "/backgroundNight.jpg",
      theme: newIsDayTime ? 'light' : 'dark' as 'light' | 'dark'
    };
    setTheme(newTheme);
    localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
  };

  const setDayMode = () => {
    const newTheme = {
      isDayTime: true,
      backgroundImage: "/backgroundDay.jpg",
      theme: 'light' as const
    };
    setTheme(newTheme);
    localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
  };

  const setNightMode = () => {
    const newTheme = {
      isDayTime: false,
      backgroundImage: "/backgroundNight.jpg",
      theme: 'dark' as const
    };
    setTheme(newTheme);
    localStorage.setItem('selectedTheme', JSON.stringify(newTheme));
  };

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