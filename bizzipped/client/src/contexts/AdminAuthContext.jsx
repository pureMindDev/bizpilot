import { createContext, useContext, useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bizpilot_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .get('/admin/auth/me')
      .then((res) => setAdmin(res.data.admin))
      .catch(() => {
        localStorage.removeItem('bizpilot_admin_token');
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await adminApi.post('/admin/auth/login', { email, password });
      localStorage.setItem('bizpilot_admin_token', res.data.token);
      setAdmin(res.data.admin);
      return res.data.admin;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const logout = () => {
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
