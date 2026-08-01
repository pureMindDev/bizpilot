import { FiMenu } from 'react-icons/fi';
import Breadcrumb from './Breadcrumb';
import AdminSearchBar from './AdminSearchBar';
import ThemeToggle from '../layout/ThemeToggle';
import AdminNotificationPanel from './AdminNotificationPanel';
import AdminProfileDropdown from './AdminProfileDropdown';
import styles from '../layout/Navbar.module.scss';

export default function AdminNavbar({ onMenuClick }) {
  return (
    <div>
      <header className={styles.navbar} style={{ gap: 18 }}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <FiMenu size={20} />
        </button>
        <AdminSearchBar />
        <div className={styles.actions}>
          <ThemeToggle />
          <AdminNotificationPanel />
          <AdminProfileDropdown />
        </div>
      </header>
      <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-card)' }}>
        <Breadcrumb />
      </div>
    </div>
  );
}
