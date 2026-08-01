import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withId } from '../utils/normalize';
import { roles, rolePermissions } from '../data/options';
import { useAuth } from './AuthContext';

const StaffContext = createContext();

const mapStaff = (doc) => {
  const withIdDoc = withId(doc);
  return { ...withIdDoc, joined: withIdDoc.joined || withIdDoc.createdAt };
};

export function StaffProvider({ children }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data.data.map(mapStaff));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setStaff([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchStaff();
  }, [isAuthenticated, authLoading]);

  const addStaff = async (member) => {
    const res = await api.post('/staff', member);
    const created = mapStaff(res.data.data);
    setStaff((prev) => [created, ...prev]);
    return created;
  };

  const updateStaff = async (id, updates) => {
    const res = await api.patch(`/staff/${id}`, updates);
    const updated = mapStaff(res.data.data);
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const suspendStaff = async (id) => {
    const res = await api.patch(`/staff/${id}/suspend`);
    const updated = mapStaff(res.data.data);
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteStaff = async (id) => {
    await api.delete(`/staff/${id}`);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <StaffContext.Provider value={{ staff, loading, roles, rolePermissions, addStaff, updateStaff, suspendStaff, deleteStaff, refetch: fetchStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export const useStaff = () => useContext(StaffContext);
