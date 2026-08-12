import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { useAdminAuth } from './AdminAuthContext';

const PlatformSettingsContext = createContext();

export function PlatformSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchSettings = async () => {
    try {
      const res = await adminApi.get('/admin/settings');
      setSettings(res.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSettings();
  }, [isAdminAuthenticated, authLoading]);

  const updateSettings = async (updates) => {
    try {
      const res = await adminApi.patch('/admin/settings', updates);
      setSettings(res.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  return (
    <PlatformSettingsContext.Provider value={{ settings: settings || {}, loading, updateSettings, refetch: fetchSettings }}>
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export const usePlatformSettings = () => useContext(PlatformSettingsContext);
