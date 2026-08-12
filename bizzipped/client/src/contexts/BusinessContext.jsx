import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withId, withIds } from '../utils/normalize';
import { businessCities, businessPlans, businessStatuses } from '../data/mockBusinesses';
import { useAdminAuth } from './AdminAuthContext';

const BusinessContext = createContext();

const emptyStats = { total: 0, active: 0, trial: 0, expired: 0, totalUsers: 0 };

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchBusinesses = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        adminApi.get('/admin/businesses', { params: { limit: 100 } }),
        adminApi.get('/admin/businesses/stats'),
      ]);
      setBusinesses(withIds(listRes.data.data));
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setBusinesses([]);
      setStats(emptyStats);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchBusinesses();
  }, [isAdminAuthenticated, authLoading]);

  const updateBusiness = async (id, updates) => {
    const res = await adminApi.patch(`/admin/businesses/${id}`, updates);
    const updated = withId(res.data.data);
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    return updated;
  };

  const suspendBusiness = async (id) => {
    const res = await adminApi.patch(`/admin/businesses/${id}/suspend`);
    const updated = withId(res.data.data);
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const activateBusiness = async (id) => {
    const res = await adminApi.patch(`/admin/businesses/${id}/activate`);
    const updated = withId(res.data.data);
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBusiness = async (id) => {
    await adminApi.delete(`/admin/businesses/${id}`);
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses, loading, cities: businessCities, plans: businessPlans, statuses: businessStatuses,
        updateBusiness, suspendBusiness, activateBusiness, deleteBusiness, stats, refetch: fetchBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusinesses = () => useContext(BusinessContext);
