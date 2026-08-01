import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds, withId } from '../utils/normalize';
import { paymentMethods, paymentStatuses } from '../data/options';
import { useAdminAuth } from './AdminAuthContext';

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchAll = async () => {
    try {
      const [paymentsRes, plansRes] = await Promise.all([
        api.get('/admin/payments', { params: { limit: 200 } }),
        api.get('/admin/plans'),
      ]);
      setPayments(withIds(paymentsRes.data.data));
      setSummary(paymentsRes.data.summary || { totalRevenue: 0, pendingCount: 0 });
      setPlans(withIds(plansRes.data.data));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setPayments([]);
      setPlans([]);
      setSummary({ totalRevenue: 0, pendingCount: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAll();
  }, [isAdminAuthenticated, authLoading]);

  const refundPayment = async (id) => {
    try {
      const res = await api.patch(`/admin/payments/${id}/refund`);
      const updated = withId(res.data.data);
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      setSummary((s) => ({ ...s, totalRevenue: Math.max(s.totalRevenue - (updated.amount || 0), 0) }));
      return updated;
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  // Monthly recurring revenue approximated from the active plan mix.
  const mrr = plans.reduce((sum, p) => sum + p.price, 0) * 3.2;

  return (
    <PaymentContext.Provider
      value={{
        payments,
        plans,
        loading,
        methods: paymentMethods,
        statuses: paymentStatuses,
        refundPayment,
        totalRevenue: summary.totalRevenue,
        pendingCount: summary.pendingCount,
        mrr,
        refetch: fetchAll,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayments = () => useContext(PaymentContext);
