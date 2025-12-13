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
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Divider
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
    <Container maxWidth="sm" sx={{ mt: { xs: 6, md: 10 } }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 3, md: 4 }, 
        borderRadius: 3,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Sweet Shop Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Please {isLogin ? 'login' : 'register'} to continue.
          </Typography>
        </Box>

        <Tabs
          value={isLogin ? 0 : 1}
          onChange={(_, v) => setIsLogin(v === 0)}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        <Divider sx={{ mb: 2 }} />

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }
            }}
          />

          {!isLogin && (
            <TextField
              label="Admin Key (optional)"
              type="password"
              fullWidth
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              helperText="Use admin key to register as admin"
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }
              }}
            />
          )}

          {error && (
            <Alert severity={error.includes('successful') ? 'success' : 'error'}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ 
              mt: 1, 
              py: 1.25, 
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
              }
            }}
            fullWidth
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthPage;