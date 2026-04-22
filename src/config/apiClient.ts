import axios from 'axios';
import API_URL from './api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for Standardized Payloads
apiClient.interceptors.response.use(
  (response) => {
    // If the backend uses successResponse { success: true, data: ... }
    // We return the .data content directly to simplify Redux thunks.
    if (response.data && response.data.success && response.data.data !== undefined) {
      return response.data; // Return the full response.data so thunks can access .data and .meta
    }
    return response.data; // Traditional response
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(message);
  }
);

export default apiClient;
