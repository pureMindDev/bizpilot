import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { initials } from '../../utils/format';
import styles from '../layout/ProfileDropdown.module.scss';

export default function AdminProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) return null;

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>{initials(admin.name)}</div>
        <div className={styles.info}>
          <span className={styles.name}>{admin.name.split(' ')[0]}</span>
          <span className={styles.role}>{admin.role}</span>
        </div>
        <FiChevronDown size={14} className={styles.chevron} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className={styles.panel} initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.16 }}>
            <div className={styles.userBlock}>
              <div className={styles.avatarLg} style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>{initials(admin.name)}</div>
              <div>
                <p className={styles.uName}>{admin.name}</p>
                <p className={styles.uEmail}>{admin.email}</p>
              </div>
            </div>
            <div className={styles.divider} />
            <button className={styles.menuItem} onClick={() => { setOpen(false); navigate('/admin/roles'); }}>
              <FiUser size={16} /> My role & permissions
            </button>
            <button className={styles.menuItem} onClick={() => { setOpen(false); navigate('/admin/settings'); }}>
              <FiSettings size={16} /> Platform settings
            </button>
            <div className={styles.divider} />
            <button className={`${styles.menuItem} ${styles.danger}`} onClick={handleLogout}>
              <FiLogOut size={16} /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
