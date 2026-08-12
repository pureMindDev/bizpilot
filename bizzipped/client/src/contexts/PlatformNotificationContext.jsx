import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withId } from '../utils/normalize';
import { useAdminAuth } from './AdminAuthContext';

const PlatformNotificationContext = createContext();

const mapNotification = (doc) => {
  const withIdDoc = withId(doc);
  return { ...withIdDoc, time: withIdDoc.time || withIdDoc.createdAt };
};

export function PlatformNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchNotifications = async () => {
    try {
      const res = await adminApi.get('/admin/notifications');
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
    if (!isAdminAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchNotifications();
  }, [isAdminAuthenticated, authLoading]);

  const markAsRead = async (id) => {
    try {
      const res = await adminApi.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? mapNotification(res.data.data) : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminApi.patch('/admin/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const deleteNotification = async (id) => {
    try {
      const target = notifications.find((n) => n.id === id);
      await adminApi.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <PlatformNotificationContext.Provider
      value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refetch: fetchNotifications }}
    >
      {children}
    </PlatformNotificationContext.Provider>
  );
}

export const usePlatformNotifications = () => useContext(PlatformNotificationContext);
