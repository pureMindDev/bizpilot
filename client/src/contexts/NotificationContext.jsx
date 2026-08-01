import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withId } from '../utils/normalize';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const mapNotification = (doc) => {
  const withIdDoc = withId(doc);
  return { ...withIdDoc, time: withIdDoc.time || withIdDoc.createdAt };
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.map(mapNotification));
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchNotifications();
  }, [isAuthenticated, authLoading]);

  const markAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      const updated = mapNotification(res.data.data);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const deleteNotification = async (id) => {
    try {
      const target = notifications.find((n) => n.id === id);
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refetch: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
