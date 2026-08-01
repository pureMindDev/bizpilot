import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds, withId } from '../utils/normalize';
import { businessCities, businessPlans, businessStatuses } from '../data/options';
import { useAdminAuth } from './AdminAuthContext';

const BusinessContext = createContext();

const EMPTY_STATS = { total: 0, active: 0, trial: 0, expired: 0, suspended: 0, totalUsers: 0 };

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchBusinesses = async () => {
    try {
      const [list, statsRes] = await Promise.all([
        api.get('/admin/businesses', { params: { limit: 200 } }),
        api.get('/admin/businesses/stats'),
      ]);
      setBusinesses(withIds(list.data.data));
      setStats({ ...EMPTY_STATS, ...statsRes.data.data });
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
      setStats(EMPTY_STATS);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchBusinesses();
  }, [isAdminAuthenticated, authLoading]);

  // Merges a server response back into the list while keeping the enriched
  // counters (users/products/totalSales) the list endpoint added.
  const mergeBusiness = (id, doc) => {
    const updated = withId(doc);
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    return updated;
  };

  const updateBusiness = async (id, updates) => {
    try {
      const res = await api.patch(`/admin/businesses/${id}`, updates);
      return mergeBusiness(id, res.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const suspendBusiness = async (id) => {
    try {
      const res = await api.patch(`/admin/businesses/${id}/suspend`);
      setStats((s) => ({ ...s, active: Math.max(s.active - 1, 0), suspended: s.suspended + 1 }));
      return mergeBusiness(id, res.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const activateBusiness = async (id) => {
    try {
      const res = await api.patch(`/admin/businesses/${id}/activate`);
      setStats((s) => ({ ...s, active: s.active + 1, suspended: Math.max(s.suspended - 1, 0) }));
      return mergeBusiness(id, res.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const deleteBusiness = async (id) => {
    try {
      await api.delete(`/admin/businesses/${id}`);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      setStats((s) => ({ ...s, total: Math.max(s.total - 1, 0) }));
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        loading,
        cities: businessCities,
        plans: businessPlans,
        statuses: businessStatuses,
        updateBusiness,
        suspendBusiness,
        activateBusiness,
        deleteBusiness,
        stats,
        refetch: fetchBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusinesses = () => useContext(BusinessContext);
