import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

// The UI works with a flat settings object (businessName, notifyLowStock, etc.)
// but the backend Business document nests contact info under its own top-level
// fields and notification toggles under `notificationPreferences`. These two
// functions translate between the shapes so neither side needs to know about
// the other's structure.
const fromBusinessDoc = (doc) => ({
  businessName: doc.name,
  businessEmail: doc.email,
  businessPhone: doc.phone,
  address: doc.address || '',
  logo: doc.logo,
  currency: doc.currency,
  language: doc.language,
  taxRate: doc.taxRate,
  taxEnabled: doc.taxEnabled,
  notifyLowStock: doc.notificationPreferences?.lowStock ?? true,
  notifyNewSale: doc.notificationPreferences?.newSale ?? true,
  notifyStaffLogin: doc.notificationPreferences?.staffLogin ?? false,
  notifyPayment: doc.notificationPreferences?.payment ?? true,
});

const toBusinessPayload = (flatUpdates) => {
  const payload = {};
  const direct = {
    businessName: 'name', businessEmail: 'email', businessPhone: 'phone',
    address: 'address', currency: 'currency', language: 'language',
    taxRate: 'taxRate', taxEnabled: 'taxEnabled',
  };
  Object.entries(direct).forEach(([flatKey, backendKey]) => {
    if (flatKey in flatUpdates) payload[backendKey] = flatUpdates[flatKey];
  });

  const notifyMap = { notifyLowStock: 'lowStock', notifyNewSale: 'newSale', notifyStaffLogin: 'staffLogin', notifyPayment: 'payment' };
  const notificationPreferences = {};
  let hasNotifyUpdate = false;
  Object.entries(notifyMap).forEach(([flatKey, backendKey]) => {
    if (flatKey in flatUpdates) {
      notificationPreferences[backendKey] = flatUpdates[flatKey];
      hasNotifyUpdate = true;
    }
  });
  if (hasNotifyUpdate) payload.notificationPreferences = notificationPreferences;

  return payload;
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchSettings = async () => {
    try {
      const res = await api.get('/business');
      setSettings(fromBusinessDoc(res.data.data));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSettings();
  }, [isAuthenticated, authLoading]);

  const updateSettings = async (updates) => {
    try {
      const res = await api.patch('/business', toBusinessPayload(updates));
      setSettings(fromBusinessDoc(res.data.data));
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings: settings || {}, loading, updateSettings, refetch: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
