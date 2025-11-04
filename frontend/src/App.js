import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeContextProvider } from './contexts/ThemeContext';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './views/Home';
import Reports from './views/Reports';
import Settings from './views/Settings';
import PrivateRoute from './components/PrivateRoute';
import UserDocs from './views/UserDocs';
import UserData from './views/UserData';
import UserCalendar from './views/UserCalendar';
import UserCases from './views/UserCases';
import CalendarView from './views/UserCalendar';
import Register from './views/Register';
import ChatPage from './views/ChatPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ThemeContextProvider>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <ChatPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

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
              path="/home"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Dashboard />
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
                    <CalendarView />
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
      </ThemeContextProvider>
    </AuthProvider>
  );
}

export default App;
