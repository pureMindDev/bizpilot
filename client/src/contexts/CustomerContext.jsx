import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withId } from '../utils/normalize';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

// Maps a raw API customer doc to the shape the UI expects (id + joined date).
const mapCustomer = (doc) => {
  const withIdDoc = withId(doc);
  return { ...withIdDoc, joined: withIdDoc.joined || withIdDoc.createdAt };
};

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers', { params: { limit: 100 } });
      setCustomers(res.data.data.map(mapCustomer));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchCustomers();
  }, [isAuthenticated, authLoading]);

  const addCustomer = async (customer) => {
    const res = await api.post('/customers', customer);
    const created = mapCustomer(res.data.data);
    setCustomers((prev) => [created, ...prev]);
    return created;
  };

  const updateCustomer = async (id, updates) => {
    const res = await api.patch(`/customers/${id}`, updates);
    const updated = mapCustomer(res.data.data);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteCustomer = async (id) => {
    await api.delete(`/customers/${id}`);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CustomerContext.Provider value={{ customers, loading, addCustomer, updateCustomer, deleteCustomer, refetch: fetchCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomers = () => useContext(CustomerContext);
