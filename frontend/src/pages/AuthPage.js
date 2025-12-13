import React, { useState } from 'react';
import {
  Container, Paper, Tabs, Tab, Box, TextField, Button, Typography, Alert
} from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await api.post(endpoint, { email, password });

      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role || 'user');
        navigate('/');
      } else {
        setIsLogin(true);  // switch to login after successful register
        setError('Registration successful! Now login.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Sweet Shop Management
        </Typography>

        <Tabs value={isLogin ? 0 : 1} onChange={(_, v) => setIsLogin(v === 0)} centered sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <Alert severity={error.includes('successful') ? 'success' : 'error'} sx={{ mt: 2 }}>{error}</Alert>}

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, py: 1.5 }}>
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthPage;