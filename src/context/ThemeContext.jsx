import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    return true;
  }

  if (savedTheme === 'light') {
    return false;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    if (typeof document === 'undefined') {
      setDarkMode((previousMode) => !previousMode);
      return;
    }

    document.documentElement.classList.add('no-transition');

    setDarkMode((previousMode) => {
      const nextMode = !previousMode;
      document.documentElement.classList.toggle('dark', nextMode);
      localStorage.setItem('theme', nextMode ? 'dark' : 'light');
      return nextMode;
    });

    window.getComputedStyle(document.documentElement).getPropertyValue('color');

    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 50);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
