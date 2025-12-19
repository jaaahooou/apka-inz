  import React, { createContext, useState, useEffect } from 'react';
  import { createTheme, ThemeProvider } from '@mui/material/styles';

  export const ThemeContext = createContext();

  // Definicje motywów
  const themes = {
    dark: {
      name: 'Ciemnoszary',
      palette: {
        mode: 'dark',
        primary: { main: '#e0e0e0' },
        secondary: { main: '#bdbdbd' },
        background: { default: '#111111', paper: '#1e1e1e' },
        text: { primary: '#e0e0e0', secondary: '#9e9e9e' },
      },
    },
    navy: {
      name: 'Granatowy',
      palette: {
        mode: 'dark',
        primary: { main: '#1a3a52' },
        secondary: { main: '#2c5aa0' },
        background: { default: '#0f1419', paper: '#1a2332' },
        text: { primary: '#e8f0ff', secondary: '#a8c5e0' },
      },
    },
    burgundy: {
      name: 'Bordowy',
      palette: {
        mode: 'dark',
        primary: { main: '#8b3a3a' },
        secondary: { main: '#c94949' },
        background: { default: '#1a0f0f', paper: '#2d1a1a' },
        text: { primary: '#f5e0e0', secondary: '#d4a5a5' },
      },
    },
    light: {
      name: 'Jasny',
      palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
        background: { default: '#fafafa', paper: '#ffffff' },
        text: { primary: '#212121', secondary: '#757575' },
      },
    },
  };

  export const ThemeContextProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
      return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
      localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    const muiTheme = createTheme({
      ...themes[currentTheme],
      typography: {
        fontFamily: 'Montserrat, Arial, sans-serif',
      },
    });

    const changeTheme = (themeName) => {
      if (themes[themeName]) {
        setCurrentTheme(themeName);
      }
    };

    return (
      <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
        <ThemeProvider theme={muiTheme}>
          {children}
        </ThemeProvider>
      </ThemeContext.Provider>
    );
  };