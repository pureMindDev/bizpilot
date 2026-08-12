import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds, withId } from '../utils/normalize';
import { ticketPriorities, ticketStatuses, supportAgents } from '../data/mockTickets';
import { useAdminAuth } from './AdminAuthContext';

const SupportContext = createContext();

export function SupportProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchTickets = async () => {
    try {
      const res = await adminApi.get('/admin/tickets');
      setTickets(withIds(res.data.data));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchTickets();
  }, [isAdminAuthenticated, authLoading]);

  const applyUpdate = (id, updated) => setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));

  const assignTicket = async (id, agent) => {
    const res = await adminApi.patch(`/admin/tickets/${id}/assign`, { assignedTo: agent });
    applyUpdate(id, withId(res.data.data));
  };

  const resolveTicket = async (id) => {
    const res = await adminApi.patch(`/admin/tickets/${id}/resolve`);
    applyUpdate(id, withId(res.data.data));
  };

  const closeTicket = async (id) => {
    const res = await adminApi.patch(`/admin/tickets/${id}/close`);
    applyUpdate(id, withId(res.data.data));
  };

  const addComment = async (id, comment) => {
    const res = await adminApi.post(`/admin/tickets/${id}/comments`, { text: comment.text });
    applyUpdate(id, withId(res.data.data));
  };

  return (
    <SupportContext.Provider
      value={{ tickets, loading, priorities: ticketPriorities, statuses: ticketStatuses, agents: supportAgents, assignTicket, resolveTicket, closeTicket, addComment, refetch: fetchTickets }}
    >
      {children}
    </SupportContext.Provider>
  );
}

export const useSupport = () => useContext(SupportContext);
