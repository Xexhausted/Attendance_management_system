import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import Login from './pages/Login';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { CalendarPage } from './pages/Calendar';
import { SettingsPage } from './pages/Settings';
import AnalyticsPage from './pages/Analytics';
import LoginTest from './components/LoginTest';
import ProtectedRoute from './components/ProtectedRoute';
import Analytics from './pages/Analytics';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/test" element={<LoginTest />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
            <Route path="*" element={<NotFound />} />
          </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
);
}

export default App; 