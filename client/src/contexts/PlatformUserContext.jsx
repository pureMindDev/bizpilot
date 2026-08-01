import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds, withId } from '../utils/normalize';
import { useAdminAuth } from './AdminAuthContext';

const PlatformUserContext = createContext();

export function PlatformUserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { limit: 200 } });
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
    try {
      const res = await api.patch(`/admin/users/${id}/suspend`);
      const updated = withId(res.data.data);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
      return updated;
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  return (
    <PlatformUserContext.Provider value={{ users, loading, suspendUser, deleteUser, refetch: fetchUsers }}>
      {children}
    </PlatformUserContext.Provider>
  );
}

export const usePlatformUsers = () => useContext(PlatformUserContext);
