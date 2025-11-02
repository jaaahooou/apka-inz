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
import PrivateRoute from './components/PrivateRoute';  // import PrivateRoute
import UserDocs from './views/UserDocs';
import UserData from './views/UserData';
import UserCalendar from './views/UserCalendar';
import UserCases from './views/UserCases';
import CalendarForUser from './components/CalendarForUser';
import Register from './views/Register';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: { default: '#111111 ', paper: '#000000' },
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

          {/* Chronione trasy: opakowane w PrivateRoute */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/register"
            element={
             
                <Register />
         
            }
          />

          <Route
            path="/home"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <Home />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/userdocs"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <UserDocs />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/userdata"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <UserData />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/usercalendar"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <UserCalendar />
                  <CalendarForUser />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/usercases"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <UserCases />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
