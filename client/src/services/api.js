import axios from 'axios';

// Base API client — points at the Node.js/Express/MongoDB backend.
// Set VITE_API_URL in your .env to change the API origin.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Admin console routes live under /admin/* and are authenticated with a
// separate admin JWT, so pick the right token per request.
const isAdminRequest = (url = '') => url.startsWith('/admin') || url.startsWith('admin');

api.interceptors.request.use((config) => {
  const admin = isAdminRequest(config.url || '');
  const token = localStorage.getItem(admin ? 'bizpilot_admin_token' : 'bizpilot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const admin = isAdminRequest(err.config?.url || '');
      localStorage.removeItem(admin ? 'bizpilot_admin_token' : 'bizpilot_token');
      if (admin) localStorage.removeItem('bizpilot_admin');
    }
    return Promise.reject(err);
  }
);

// Simulates network latency where a UI intentionally fakes a slow call.
export const mockDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export default api;
