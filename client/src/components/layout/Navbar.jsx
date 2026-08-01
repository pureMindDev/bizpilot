import { FiMenu } from 'react-icons/fi';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import NotificationPanel from './NotificationPanel';
import ProfileDropdown from './ProfileDropdown';
import styles from './Navbar.module.scss';

export default function Navbar({ onMenuClick }) {
  return (
    <header className={styles.navbar}>
      <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
        <FiMenu size={20} />
      </button>
      <SearchBar />
      <div className={styles.actions}>
        <ThemeToggle />
        <NotificationPanel />
        <ProfileDropdown />
      </div>
    </header>
  );
}
