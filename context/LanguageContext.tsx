import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Language = 'it' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);
const LANGUAGE_STORAGE_KEY = '@app:language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && (saved === 'it' || saved === 'en')) {
          setLanguage(saved);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  // Save language when it changes
  const saveLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: saveLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
