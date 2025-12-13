/**
 * Main Application Component
 * 
 * This is the root component that:
 * - Sets up routing for the entire application
 * - Protects routes so only authenticated users can access them
 * - Restricts admin routes to users with admin role
 * - Displays the navigation bar on all pages
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';

/**
 * ProtectedRoute Component
 * 
 * Wraps routes to ensure:
 * 1. Users are logged in (have a token)
 * 2. Only admin users can access admin routes
 * 
 * If conditions are not met, user is redirected to login or home page
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');  // Check if user is logged in
  const role = localStorage.getItem('role');    // Get user's role

  // If user is not logged in, send them to login page
  if (!token) return <Navigate to="/login" />;
  
  // If this is an admin-only route and user is not admin, send them to home page
  if (adminOnly && role !== 'admin') return <Navigate to="/" />;
  
  // User meets all requirements, allow access
  return children;
};

/**
 * Main App Component
 * Defines all routes and their protection levels
 */
function App() {
  return (
    <Router>
      {/* Navigation bar appears on all pages */}
      <Navbar />

      <Routes>
        {/* Login/Register page - accessible to everyone */}
        <Route path="/login" element={<AuthPage />} />

        {/* Home page - requires login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Admin panel - requires login AND admin role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;