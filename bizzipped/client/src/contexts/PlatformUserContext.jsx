import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds } from '../utils/normalize';
import { useAdminAuth } from './AdminAuthContext';

const PlatformUserContext = createContext();

export function PlatformUserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchUsers = async () => {
    try {
      const res = await adminApi.get('/admin/users', { params: { limit: 100 } });
      setUsers(withIds(res.data.data));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchUsers();
  }, [isAdminAuthenticated, authLoading]);

  const suspendUser = async (id) => {
    const res = await adminApi.patch(`/admin/users/${id}/suspend`);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: res.data.data.status } : u)));
  };

  const deleteUser = async (id) => {
    await adminApi.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <PlatformUserContext.Provider value={{ users, loading, suspendUser, deleteUser, refetch: fetchUsers }}>
      {children}
    </PlatformUserContext.Provider>
  );
}

export const usePlatformUsers = () => useContext(PlatformUserContext);
