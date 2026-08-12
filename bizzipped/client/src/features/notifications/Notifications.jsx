import { FiCheckCircle, FiAlertTriangle, FiInfo, FiTrash2, FiCheck, FiBell } from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';
import { timeAgo } from '../../utils/format';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const ICONS = { success: FiCheckCircle, warning: FiAlertTriangle, info: FiInfo };
const TYPE_TONE = { stock: 'warning', sale: 'success', staff: 'info', customer: 'info', payment: 'success' };

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" icon={FiCheck} onClick={markAllAsRead}>Mark all as read</Button>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <EmptyState icon={FiBell} title="No notifications" message="You're all caught up — new activity will show up here." />
        ) : (
          <div>
            {notifications.map((n, i) => {
              const Icon = ICONS[TYPE_TONE[n.type]] || FiInfo;
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', gap: 14, padding: '16px 22px',
                    borderBottom: i < notifications.length - 1 ? '1px solid var(--border-soft)' : 'none',
                    background: n.read ? 'transparent' : 'var(--primary-50)',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-hover)', color: 'var(--text-secondary)',
                  }}>
                    <Icon size={17} />
                  </div>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => markAsRead(n.id)}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</p>
                    <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>{n.message}</p>
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
