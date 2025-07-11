import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  dark: {
    name: 'Dark',
    className: 'theme-dark',
    primary: '#6366f1',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    accent: '#8b5cf6'
  },
  light: {
    name: 'Light',
    className: 'theme-light',
    primary: '#6366f1',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    accent: '#8b5cf6'
  },
  sepia: {
    name: 'Sepia',
    className: 'theme-sepia',
    primary: '#d97706',
    background: '#fef3c7',
    surface: '#fef3c7',
    text: '#451a03',
    accent: '#ea580c'
  },
  highContrast: {
    name: 'High Contrast',
    className: 'theme-high-contrast',
    primary: '#ffff00',
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    accent: '#00ff00'
  },
  focus: {
    name: 'Focus Mode',
    className: 'theme-focus',
    primary: '#059669',
    background: '#064e3b',
    surface: '#065f46',
    text: '#ecfdf5',
    accent: '#10b981'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('pathwayiq-theme');
    return saved ? JSON.parse(saved) : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('pathwayiq-theme', JSON.stringify(currentTheme));
    
    // Apply theme to document
    const theme = themes[currentTheme];
    document.documentElement.className = theme.className;
    
    // Set CSS custom properties
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-background', theme.background);
    document.documentElement.style.setProperty('--color-surface', theme.surface);
    document.documentElement.style.setProperty('--color-text', theme.text);
    document.documentElement.style.setProperty('--color-accent', theme.accent);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    changeTheme,
    availableThemes: Object.keys(themes)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};