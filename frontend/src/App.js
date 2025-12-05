import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

import Dashboard from './views/Dashboard';
import Login from './views/Login';
import Register from './views/Register';
import Home from './views/Home';
import Reports from './views/Reports';
import Settings from './views/Settings';
import UserDocs from './views/UserDocs';
import UserData from './views/UserData';
import UserCases from './views/UserCases';
import CalendarView from './views/UserCalendar';
import ChatPage from './views/ChatPage';
import AdminUsersPage from './views/AdminUsersPage';
import CreateCasePage from './views/CreateCasePage';
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import JudgeDocket from './views/JudgeDocket';
import CaseDetailsPage from './views/CaseDetailsPage';
import { RouteOutlined } from '@mui/icons-material';
import AdminCasesPage from './views/AdminCasesPage';

function App() {
  return (
    <AuthProvider>
      <ThemeContextProvider>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* --- TRASY PUBLICZNE --- */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 1. Panel Admina (Zarządzanie użytkownikami) */}
            <Route 
                path="/admin/users" 
                element={
                    <PrivateRoute>
                        <DashboardLayout>
                             <AdminUsersPage />
                        </DashboardLayout>
                    </PrivateRoute>
                } 
            />

            {/* 2. Rejestracja Sprawy (Sekretariat) */}
            <Route 
                path="/create-case" 
                element={
                    <PrivateRoute>
                        <DashboardLayout>
                             <CreateCasePage />
                        </DashboardLayout>
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/cases/:id" 
                element={
                <CaseDetailsPage />
                } 
            />

            <Route
              path="/admin/cases"
              element={
                <AdminCasesPage />
              }
            />

            <Route 
                path="/judge/docket" 
                element={
                    <PrivateRoute>
                        <DashboardLayout>
                             <JudgeDocket />
                        </DashboardLayout>
                    </PrivateRoute>
                } 
            />
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
            
            {/* Opcjonalnie: obsługa 404 (nieznanej ścieżki) */}
            <Route path="*" element={<Navigate to="/home" replace />} />

          </Routes>
        </BrowserRouter>
      </ThemeContextProvider>
    </AuthProvider>
  );
}

export default App;