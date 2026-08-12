import { useState, useMemo } from 'react';
import { FiShield, FiDollarSign, FiBriefcase, FiSettings, FiTrash2, FiCheck, FiBell } from 'react-icons/fi';
import { usePlatformNotifications } from '../../../contexts/PlatformNotificationContext';
import { timeAgo } from '../../../utils/format';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';

const ICONS = { security: FiShield, payment: FiDollarSign, business: FiBriefcase, system: FiSettings };
const TYPE_LABEL = { security: 'Security Alert', payment: 'Payment Alert', business: 'Business Alert', system: 'Platform Update' };

export default function PlatformNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = usePlatformNotifications();
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => notifications.filter((n) => filter === 'All' || n.type === filter), [notifications, filter]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Platform Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="form-select" style={{ width: 170 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All types</option>
            <option value="security">Security Alerts</option>
            <option value="payment">Payment Alerts</option>
            <option value="business">Business Alerts</option>
            <option value="system">Platform Updates</option>
          </select>
          {unreadCount > 0 && <Button variant="secondary" icon={FiCheck} onClick={markAllAsRead}>Mark all as read</Button>}
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState icon={FiBell} title="No notifications" message="Platform alerts will show up here." />
        ) : (
          <div>
            {filtered.map((n, i) => {
              const Icon = ICONS[n.type] || FiBell;
              return (
                <div key={n.id} style={{
                  display: 'flex', gap: 14, padding: '16px 22px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-soft)' : 'none',
                  background: n.read ? 'transparent' : 'var(--primary-50)',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-hover)', color: 'var(--text-secondary)',
                  }}><Icon size={17} /></div>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => markAsRead(n.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</p>
                      <span className="badge badge-neutral">{TYPE_LABEL[n.type]}</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>{timeAgo(n.time)}</p>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={() => deleteNotification(n.id)} aria-label="Delete notification">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
