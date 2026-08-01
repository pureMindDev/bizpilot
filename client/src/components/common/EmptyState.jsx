import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ icon: Icon = FiInbox, title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="empty-state">
      <Icon size={40} strokeWidth={1.5} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
