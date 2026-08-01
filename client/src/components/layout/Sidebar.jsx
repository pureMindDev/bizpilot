import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiBox, FiShoppingCart, FiUsers, FiUserCheck,
  FiBarChart2, FiCreditCard, FiSettings, FiX, FiZap,
} from 'react-icons/fi';
import styles from './Sidebar.module.scss';

const NAV_ITEMS = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/inventory', icon: FiBox, label: 'Inventory' },
  { to: '/sales', icon: FiShoppingCart, label: 'Sales (POS)' },
  { to: '/customers', icon: FiUsers, label: 'Customers' },
  { to: '/staff', icon: FiUserCheck, label: 'Staff' },
  { to: '/reports', icon: FiBarChart2, label: 'Reports' },
  { to: '/expenses', icon: FiCreditCard, label: 'Expenses' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
];

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside className={styles.sidebar}>
        <SidebarContent onCloseMobile={onCloseMobile} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.scrim}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
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
        <div className={styles.brandMark}><FiZap size={18} /></div>
        <span>BizPilot</span>
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
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.upsell}>
          <p className={styles.upsellTitle}>Growing fast?</p>
          <p className={styles.upsellText}>Upgrade to BizPilot Pro for multi-branch support.</p>
          <button className={styles.upsellBtn}>Upgrade plan</button>
        </div>
      </div>
    </>
  );
}
