import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { useAdminAuth } from './AdminAuthContext';

const AdminRoleContext = createContext();

const PERMISSION_MODULES = [
  'Dashboard', 'Businesses', 'Subscriptions', 'Payments', 'Users', 'Support', 'Notifications', 'Audit Logs', 'Settings', 'Roles & Permissions',
];

const ROLES = ['Super Admin', 'Support', 'Finance', 'Developer', 'Operations'];

const emptyMatrix = () =>
  ROLES.reduce(
    (acc, role) => ({
      ...acc,
      [role]: PERMISSION_MODULES.reduce((mods, m) => ({ ...mods, [m]: { view: false, edit: false, delete: false } }), {}),
    }),
    {}
  );

// Turns the API's [{ role, permissions }] rows into role -> module -> flags.
const toMatrix = (rows = []) => {
  const matrix = emptyMatrix();
  rows.forEach((row) => {
    const perms = row.permissions || {};
    PERMISSION_MODULES.forEach((m) => {
      matrix[row.role] = matrix[row.role] || {};
      matrix[row.role][m] = { view: false, edit: false, delete: false, ...(perms[m] || {}) };
    });
  });
  return matrix;
};

export function AdminRoleProvider({ children }) {
  const [matrix, setMatrix] = useState(emptyMatrix());
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchRoles = async () => {
    try {
      const res = await api.get('/admin/roles');
      setMatrix(toMatrix(res.data.data.matrix));
      setTeam((res.data.data.team || []).map((m) => ({ ...m, id: m._id ?? m.id })));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setMatrix(emptyMatrix());
      setTeam([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchRoles();
  }, [isAdminAuthenticated, authLoading]);

  const togglePermission = async (role, module, key) => {
    if (role === 'Super Admin') return;
    const nextValue = !matrix[role]?.[module]?.[key];
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [module]: { ...prev[role][module], [key]: nextValue } },
    }));
    try {
      await api.patch(`/admin/roles/${encodeURIComponent(role)}`, { module, key, value: nextValue });
    } catch (err) {
      toast.error(extractErrorMessage(err));
      fetchRoles();
    }
  };

  return (
    <AdminRoleContext.Provider
      value={{ matrix, team, loading, modules: PERMISSION_MODULES, roles: ROLES, togglePermission, refetch: fetchRoles }}
    >
      {children}
    </AdminRoleContext.Provider>
  );
}

export const useAdminRoles = () => useContext(AdminRoleContext);
