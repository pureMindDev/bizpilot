import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate the admin from the API rather than trusting stale localStorage.
  useEffect(() => {
    const token = localStorage.getItem('bizpilot_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/admin/auth/me')
      .then((res) => {
        setAdmin(res.data.admin);
        localStorage.setItem('bizpilot_admin', JSON.stringify(res.data.admin));
      })
      .catch(() => {
        localStorage.removeItem('bizpilot_admin_token');
        localStorage.removeItem('bizpilot_admin');
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await api.post('/admin/auth/login', { email, password });
      localStorage.setItem('bizpilot_admin_token', res.data.token);
      localStorage.setItem('bizpilot_admin', JSON.stringify(res.data.admin));
      setAdmin(res.data.admin);
      return res.data.admin;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const logout = () => {
    localStorage.removeItem('bizpilot_admin');
    localStorage.removeItem('bizpilot_admin_token');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isAdminAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
