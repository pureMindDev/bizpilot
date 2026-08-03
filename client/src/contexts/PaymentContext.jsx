import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withId, withIds } from '../utils/normalize';
import { useAdminAuth } from './AdminAuthContext';

const PaymentContext = createContext();
const PAYMENT_METHODS = ['Paystack', 'Flutterwave', 'Stripe', 'Bank Transfer'];
const PAYMENT_STATUSES = ['Paid', 'Pending', 'Failed', 'Refunded'];

export function PaymentProvider({ children }) {
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchAll = async () => {
    try {
      const [paymentsRes, plansRes] = await Promise.all([
        adminApi.get('/admin/payments', { params: { limit: 100 } }),
        adminApi.get('/admin/plans'),
      ]);
      setPayments(withIds(paymentsRes.data.data));
      setTotalRevenue(paymentsRes.data.summary.totalRevenue);
      setPendingCount(paymentsRes.data.summary.pendingCount);
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
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAll();
  }, [isAdminAuthenticated, authLoading]);

  const refundPayment = async (id) => {
    const res = await adminApi.patch(`/admin/payments/${id}/refund`);
    const updated = withId(res.data.data);
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const mrr = plans.reduce((sum, p) => sum + p.price, 0) * 3.2;

  return (
    <PaymentContext.Provider
      value={{ payments, plans, loading, methods: PAYMENT_METHODS, statuses: PAYMENT_STATUSES, refundPayment, totalRevenue, pendingCount, mrr, refetch: fetchAll }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayments = () => useContext(PaymentContext);
