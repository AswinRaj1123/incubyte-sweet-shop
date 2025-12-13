/**
 * Navigation Bar Component
 * 
 * Displays the application header with:
 * - App title
 * - Admin Panel button (only visible for admin users)
 * - Logout button
 * 
 * The navbar is aware of authentication state and user role.
 * Updates when user navigates to different pages (e.g., after login).
 */

import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  // ===== HOOKS =====
  const navigate = useNavigate();  // For navigation (logout redirect)
  const location = useLocation();  // Detects when user logs in or page changes
  
  // ===== STATE =====
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));  // Current user's role

  /**
   * Update user role when page location changes
   * 
   * This effect is necessary because:
   * - useLocation hook detects route changes
   * - When user logs in, role is stored in localStorage
   * - This effect re-reads localStorage after login redirect
   * - Navbar updates to show/hide Admin Panel button based on role
   */
  useEffect(() => {
    // Read current user role from localStorage
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, [location]);  // Re-run whenever user navigates to a new page

  /**
   * Handle logout action
   * - Clears JWT token from localStorage
   * - Clears user role from localStorage
   * - Updates navbar state
   * - Redirects to login page
   */
  const handleLogout = () => {
    localStorage.removeItem('token');  // Clear authentication token
    localStorage.removeItem('role');  // Clear user role
    setUserRole(null);  // Update navbar state
    navigate('/login');  // Redirect to login page
  };

  // ===== RENDER =====
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* App Title */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Sweet Shop Management
        </Typography>
        
        {/* Admin Panel Button - Only visible for admin users */}
        {userRole === 'admin' && (
          <Button 
            color="inherit" 
            onClick={() => navigate('/admin')}
            sx={{ mr: 2 }}
          >
            Admin Panel
          </Button>
        )}
        
        {/* Logout Button */}
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;