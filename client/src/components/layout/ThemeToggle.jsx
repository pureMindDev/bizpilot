import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.scss';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className={styles.toggle} onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? <FiMoon size={17} /> : <FiSun size={17} />}
    </button>
  );
}
