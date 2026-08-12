import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiBriefcase, FiCreditCard, FiDollarSign, FiUsers,
  FiHeadphones, FiBell, FiFileText, FiSettings, FiBarChart2, FiLock, FiX, FiShield,
} from 'react-icons/fi';
import styles from './AdminSidebar.module.scss';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/businesses', icon: FiBriefcase, label: 'Businesses' },
  { to: '/admin/subscriptions', icon: FiCreditCard, label: 'Subscriptions' },
  { to: '/admin/payments', icon: FiDollarSign, label: 'Payments' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/support', icon: FiHeadphones, label: 'Support' },
  { to: '/admin/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/admin/audit-logs', icon: FiFileText, label: 'Audit Logs' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/roles', icon: FiLock, label: 'Roles & Permissions' },
  { to: '/admin/settings', icon: FiSettings, label: 'Platform Settings' },
];

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside className={styles.sidebar}>
        <SidebarContent onCloseMobile={onCloseMobile} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCloseMobile} />
            <motion.aside
              className={styles.mobileSidebar}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <SidebarContent onCloseMobile={onCloseMobile} showClose />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ onCloseMobile, showClose }) {
  return (
    <>
      <div className={styles.brand}>
        <div className={styles.brandMark}><FiShield size={17} /></div>
        <div>
          <span>BizPilot</span>
          <small>Platform Console</small>
        </div>
        {showClose && (
          <button className={styles.closeBtn} onClick={onCloseMobile} aria-label="Close menu">
            <FiX size={20} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.badge}>
          <FiShield size={13} /> Super Admin access
        </div>
      </div>
    </>
  );
}
