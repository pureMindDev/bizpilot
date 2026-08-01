import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds } from '../utils/normalize';
import { useAdminAuth } from './AdminAuthContext';

const PlatformNotificationContext = createContext();

// The UI renders `time`; the API stores it as createdAt.
const mapNotification = (doc) => ({ ...doc, id: doc._id ?? doc.id, time: doc.time || doc.createdAt });

export function PlatformNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(withIds(res.data.data).map(mapNotification));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchNotifications();
  }, [isAdminAuthenticated, authLoading]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.patch(`/admin/notifications/${id}/read`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.patch('/admin/notifications/read-all');
    } catch (err) {
      toast.error(extractErrorMessage(err));
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    const previous = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.delete(`/admin/notifications/${id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setNotifications(previous);
    }
  };

  return (
    <PlatformNotificationContext.Provider
      value={{ notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, refetch: fetchNotifications }}
    >
      {children}
    </PlatformNotificationContext.Provider>
  );
}

export const usePlatformNotifications = () => useContext(PlatformNotificationContext);
