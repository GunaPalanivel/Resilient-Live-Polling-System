import axios from 'axios';
import { SessionService } from '../utils/session';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session ID to all requests
apiClient.interceptors.request.use((config) => {
  const sessionId = SessionService.getSessionId();
  if (sessionId) {
    config.headers['x-student-session-id'] = sessionId;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Student has been removed
      window.location.href = '/removed';
    }
    return Promise.reject(error);
  }
);
