/**
 * API Service Configuration
 * 
 * This file sets up the Axios HTTP client that communicates with the FastAPI backend.
 * It automatically adds the JWT authentication token to every API request.
 * 
 * Without this, the backend would reject requests that require authentication.
 */

import axios from 'axios';

// Create an Axios instance configured to connect to the FastAPI backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',  // Backend server location
});

/**
 * Request Interceptor - Runs before every API request
 * 
 * This function:
 * 1. Gets the JWT token from browser storage
 * 2. Adds it to the Authorization header
 * 3. Sends the request with authentication
 * 
 * If there's no token (user not logged in), the request is still sent but will fail
 * if the endpoint requires authentication.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');  // Get token from browser storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Add token to request header
  }
  return config;
});

export default api;