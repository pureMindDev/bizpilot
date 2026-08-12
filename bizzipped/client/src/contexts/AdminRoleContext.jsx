import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds } from '../utils/normalize';
import { useAdminAuth } from './AdminAuthContext';

const AdminRoleContext = createContext();

const PERMISSION_MODULES = [
  'Dashboard', 'Businesses', 'Subscriptions', 'Payments', 'Users', 'Support', 'Notifications', 'Audit Logs', 'Settings', 'Roles & Permissions',
];
const ROLES = ['Super Admin', 'Support', 'Finance', 'Developer', 'Operations'];

export function AdminRoleProvider({ children }) {
  const [matrix, setMatrix] = useState({});
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchRoles = async () => {
    try {
      const res = await adminApi.get('/admin/roles');
      // Backend returns matrix as an array of { role, permissions } docs;
      // the UI reads it as an object keyed by role name.
      const matrixObj = Object.fromEntries(res.data.data.matrix.map((r) => [r.role, r.permissions]));
      setMatrix(matrixObj);
      setTeam(withIds(res.data.data.team));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setMatrix({});
      setTeam([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchRoles();
  }, [isAdminAuthenticated, authLoading]);

  const togglePermission = async (role, module, key) => {
    if (role === 'Super Admin') return;
    try {
      const res = await adminApi.patch(`/admin/roles/${role}`, { module, key });
      setMatrix((prev) => ({ ...prev, [role]: res.data.data.permissions }));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <AdminRoleContext.Provider value={{ matrix, team, loading, modules: PERMISSION_MODULES, roles: ROLES, togglePermission }}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export const useAdminRoles = () => useContext(AdminRoleContext);
