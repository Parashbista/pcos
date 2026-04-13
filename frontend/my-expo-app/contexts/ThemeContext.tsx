import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, darkColors } from '../constants/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: typeof colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DARK_MODE_KEY = 'dark_mode_preference';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const savedPreference = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (savedPreference !== null) {
        setIsDarkMode(savedPreference === 'true');
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem(DARK_MODE_KEY, String(newValue));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const currentColors = isDarkMode ? darkColors : colors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors: currentColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
