import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
const THEME_STORAGE_KEY = '@app:theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getEffectiveTheme());

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setMode(saved);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Update theme when mode or system setting changes
  useEffect(() => {
    setTheme(getEffectiveTheme());
  }, [mode, systemColorScheme]);

  // Save theme when mode changes
  const saveMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode: saveMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
