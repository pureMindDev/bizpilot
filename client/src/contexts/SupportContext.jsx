import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds, withId } from '../utils/normalize';
import { ticketPriorities, ticketStatuses, supportAgents } from '../data/options';
import { useAdminAuth } from './AdminAuthContext';

const SupportContext = createContext();

export function SupportProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchTickets = async () => {
    try {
      const res = await api.get('/admin/tickets');
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

  // The mutation endpoints return the raw ticket (business is an ObjectId),
  // so merge onto the existing row to keep the populated business name.
  const merge = (id, doc) => {
    const updated = withId(doc);
    let merged = updated;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        merged = { ...t, ...updated, business: t.business };
        return merged;
      })
    );
    return merged;
  };

  const request = async (id, fn) => {
    try {
      const res = await fn();
      return merge(id, res.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const assignTicket = (id, agent) => request(id, () => api.patch(`/admin/tickets/${id}/assign`, { assignedTo: agent }));
  const resolveTicket = (id) => request(id, () => api.patch(`/admin/tickets/${id}/resolve`));
  const closeTicket = (id) => request(id, () => api.patch(`/admin/tickets/${id}/close`));
  const addComment = (id, comment) => request(id, () => api.post(`/admin/tickets/${id}/comments`, { text: comment.text }));

  // Kept for local-only field tweaks that have no dedicated endpoint.
  const updateTicket = (id, updates) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));

  return (
    <SupportContext.Provider
      value={{
        tickets,
        loading,
        priorities: ticketPriorities,
        statuses: ticketStatuses,
        agents: supportAgents,
        updateTicket,
        assignTicket,
        resolveTicket,
        closeTicket,
        addComment,
        refetch: fetchTickets,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
}

export const useSupport = () => useContext(SupportContext);
