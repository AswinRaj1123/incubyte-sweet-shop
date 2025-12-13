/**
 * Authentication Page
 * 
 * Handles both user login and registration with a tab-based interface.
 * 
 * Features:
 * - Switch between Login and Register modes via tabs
 * - Email and password validation
 * - Admin registration with optional admin key
 * - JWT token storage in localStorage
 * - User role management (admin or user)
 * - Error/success message display
 * 
 * After successful login, users are redirected to home page.
 * After successful registration, the form switches to login mode.
 */

import React, { useState } from 'react';
import {
  Container, Paper, Tabs, Tab, Box, TextField, Button, Typography, Alert
} from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  // ===== STATE VARIABLES =====
  const [isLogin, setIsLogin] = useState(true);  // true = login mode, false = register mode
  const [email, setEmail] = useState('');  // User's email address
  const [password, setPassword] = useState('');  // User's password
  const [adminKey, setAdminKey] = useState('');  // Optional admin registration key
  const [error, setError] = useState('');  // Error or success message
  
  const navigate = useNavigate();  // For redirecting after successful login

  /**
   * Handle form submission for both login and registration
   * 
   * Process:
   * 1. Validate email and password format
   * 2. Send credentials to backend
   * 3. On login success: Store token/role and redirect home
   * 4. On register success: Switch to login mode
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Choose endpoint based on current mode (login or register)
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      // Build request payload with email and password
      const payload = { email, password };
      
      // Include admin key if registering with admin privileges
      if (!isLogin && adminKey) {
        payload.admin_key = adminKey;
      }
      
      // Send authentication request to backend
      const response = await api.post(endpoint, payload);

      // Handle login response - store credentials and redirect
      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role || 'user');
        navigate('/');  // Redirect to home page
      } else {
        // Handle registration response - switch to login mode with success message
        setIsLogin(true);
        setError('Registration successful! Now login.');
      }
    } catch (err) {
      // Display error message from backend or generic message
      setError(err.response?.data?.detail || 'Something went wrong');
    }
  };

  // ===== RENDER =====
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        {/* App Title */}
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Sweet Shop Management
        </Typography>

        {/* Tab Selection - Switch between Login and Register */}
        <Tabs 
          value={isLogin ? 0 : 1} 
          onChange={(_, v) => setIsLogin(v === 0)} 
          centered 
          sx={{ mb: 3 }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {/* Authentication Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Email Input */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {/* Password Input */}
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {/* Admin Key Input - Only shown in Register mode */}
          {!isLogin && (
            <TextField
              label="Admin Key (optional)"
              type="password"
              fullWidth
              margin="normal"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              helperText="Enter admin key to register as admin"
            />
          )}

          {/* Error/Success Message Display */}
          {error && (
            <Alert 
              severity={error.includes('successful') ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 3, py: 1.5 }}
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthPage;