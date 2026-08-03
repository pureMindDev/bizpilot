import axios from 'axios';

// Base API client — ready to point at a real Node.js/Express/MongoDB backend.
// Set VITE_API_URL in your .env to switch away from mock mode.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bizpilot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bizpilot_token');
    }
    return Promise.reject(err);
  }
);

// Separate client for the Super Admin console — the backend validates admin
// requests against a completely different JWT secret than business requests,
// so a leaked business token can never be used against /api/admin/* routes.
// Mirroring that separation here (its own token, its own instance) rather
// than branching on URL inside a single interceptor.
export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('bizpilot_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bizpilot_admin_token');
    }
    return Promise.reject(err);
  }
);

// Simulates network latency for mock-mode calls so loading states feel real.
export const mockDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export default api;
