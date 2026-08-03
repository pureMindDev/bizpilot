import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withIds } from '../utils/normalize';
import { auditCategories } from '../data/mockAuditLogs';
import { useAdminAuth } from './AdminAuthContext';

const AuditLogContext = createContext();

export function AuditLogProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  const fetchLogs = async () => {
    try {
      const res = await adminApi.get('/admin/audit-logs', { params: { limit: 100 } });
      setLogs(withIds(res.data.data));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdminAuthenticated) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchLogs();
  }, [isAdminAuthenticated, authLoading]);

  return (
    <AuditLogContext.Provider value={{ logs, loading, categories: auditCategories, refetch: fetchLogs }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export const useAuditLogs = () => useContext(AuditLogContext);
