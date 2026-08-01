import { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiFileText, FiMonitor } from 'react-icons/fi';
import { useAuditLogs } from '../../../contexts/AuditLogContext';
import { formatDateTime } from '../../../utils/format';
import EmptyState from '../../../components/common/EmptyState';
import TableSkeleton from '../../../components/common/TableSkeleton';

export default function AuditLogs() {
  const { logs, categories } = useAuditLogs();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || l.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [logs, search, category]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>{logs.length} recorded events across the platform</p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search by action or user..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 220 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiFileText} title="No log entries found" message="Try adjusting your search or filter." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date & time</th><th>User</th><th>Action</th><th>Business</th><th>IP address</th><th>Device</th></tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDateTime(l.time)}</td>
                    <td style={{ fontWeight: 600 }}>{l.user}</td>
                    <td>
                      <span className="badge badge-neutral">{l.category}</span>
                      <span style={{ marginLeft: 8 }}>{l.action}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{l.business}</td>
                    <td className="mono" style={{ fontSize: 12.5 }}>{l.ip}</td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><FiMonitor size={13} /> {l.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
