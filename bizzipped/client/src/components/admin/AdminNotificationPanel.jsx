import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiShield, FiDollarSign, FiBriefcase, FiSettings, FiTrash2, FiCheck } from 'react-icons/fi';
import { usePlatformNotifications } from '../../contexts/PlatformNotificationContext';
import { timeAgo } from '../../utils/format';
import styles from '../layout/NotificationPanel.module.scss';

const ICONS = { security: FiShield, payment: FiDollarSign, business: FiBriefcase, system: FiSettings };
const TONE = { security: 'danger', payment: 'success', business: 'info', system: 'warning' };

export default function AdminNotificationPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = usePlatformNotifications();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.bellBtn} onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <FiBell size={19} />
        {unreadCount > 0 && <span className={styles.dot}>{unreadCount}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className={styles.panel} initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.16 }}>
            <div className={styles.header}>
              <h4>Platform notifications</h4>
              {unreadCount > 0 && <button className={styles.markAll} onClick={markAllAsRead}><FiCheck size={13} /> Mark all read</button>}
            </div>
            <div className={styles.list}>
              {notifications.length === 0 && <div className={styles.empty}>No platform alerts.</div>}
              {notifications.map((n) => {
                const Icon = ICONS[n.type] || FiBell;
                const tone = TONE[n.type] === 'danger' ? 'warning' : TONE[n.type];
                return (
                  <div key={n.id} className={`${styles.item} ${!n.read ? styles.unread : ''}`}>
                    <div className={`${styles.iconWrap} ${styles[tone]}`}><Icon size={15} /></div>
                    <div className={styles.content} onClick={() => markAsRead(n.id)}>
                      <p className={styles.title}>{n.title}</p>
                      <p className={styles.message}>{n.message}</p>
                      <p className={styles.time}>{timeAgo(n.time)}</p>
                    </div>
                    <button className={styles.deleteBtn} onClick={() => deleteNotification(n.id)} aria-label="Delete notification"><FiTrash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
