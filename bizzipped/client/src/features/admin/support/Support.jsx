import { useState, useMemo } from 'react';
import { FiSearch, FiHeadphones } from 'react-icons/fi';
import { useSupport } from '../../../contexts/SupportContext';
import { timeAgo } from '../../../utils/format';
import EmptyState from '../../../components/common/EmptyState';
import TableSkeleton from '../../../components/common/TableSkeleton';
import TicketDrawer from './components/TicketDrawer';

const PRIORITY_TONE = { Low: 'neutral', Medium: 'info', High: 'warning', Urgent: 'danger' };
const STATUS_TONE = { Open: 'info', 'In Progress': 'warning', Resolved: 'success', Closed: 'neutral' };

export default function Support() {
  const { tickets, priorities, statuses, loading } = useSupport();
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [activeTicket, setActiveTicket] = useState(null);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.business.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priority === 'All' || t.priority === priority;
      const matchesStatus = status === 'All' || t.status === status;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tickets, search, priority, status]);

  const activeTicketFull = tickets.find((t) => t.id === activeTicket?.id);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Support Center</h1>
          <p>{tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length} tickets need attention</p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search tickets by subject or business..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="All">All priorities</option>
          {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="form-select" style={{ width: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiHeadphones} title="No tickets found" message="Try adjusting your search or filters." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Subject</th><th>Business</th><th>Priority</th><th>Status</th><th>Assigned to</th><th>Updated</th></tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setActiveTicket(t)}>
                    <td style={{ fontWeight: 600 }}>{t.subject}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.business}</td>
                    <td><span className={`badge badge-${PRIORITY_TONE[t.priority]}`}>{t.priority}</span></td>
                    <td><span className={`badge badge-${STATUS_TONE[t.status]}`}>{t.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.assignedTo}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{timeAgo(t.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TicketDrawer ticket={activeTicketFull} onClose={() => setActiveTicket(null)} />
    </div>
  );
}
