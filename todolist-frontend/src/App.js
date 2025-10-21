import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './views/Home';
import Reports from './views/Reports';
import Settings from './views/Settings';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: { default: '#111111 ', paper: '#000000'},
  },
    typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
           <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/home"
            element={
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;