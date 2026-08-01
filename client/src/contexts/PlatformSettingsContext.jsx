import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { useAdminAuth } from './AdminAuthContext';

const PlatformSettingsContext = createContext();

const DEFAULT_PLATFORM_SETTINGS = {
  platformName: 'BizPilot',
  primaryColor: '#2563EB',
  currency: 'NGN',
  language: 'English',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smsProvider: 'Termii',
  paystackEnabled: true,
  flutterwaveEnabled: true,
  stripeEnabled: false,
  sessionTimeout: 30,
  twoFactorEnabled: true,
  passwordMinLength: 8,
  passwordRequireSymbol: true,
  maintenanceMode: false,
  autoBackup: true,
  backupFrequency: 'Daily',
};

export function PlatformSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_PLATFORM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings({ ...DEFAULT_PLATFORM_SETTINGS, ...res.data.data });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setSettings(DEFAULT_PLATFORM_SETTINGS);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSettings();
  }, [isAdminAuthenticated, authLoading]);

  // Optimistic update — reverts if the API rejects the change.
  const updateSettings = async (updates) => {
    const previous = settings;
    setSettings((prev) => ({ ...prev, ...updates }));
    try {
      const res = await api.patch('/admin/settings', updates);
      setSettings({ ...DEFAULT_PLATFORM_SETTINGS, ...res.data.data });
      return res.data.data;
    } catch (err) {
      setSettings(previous);
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  return (
    <PlatformSettingsContext.Provider value={{ settings, loading, updateSettings, refetch: fetchSettings }}>
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export const usePlatformSettings = () => useContext(PlatformSettingsContext);
