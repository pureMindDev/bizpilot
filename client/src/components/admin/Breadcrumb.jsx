import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { useBusinesses } from '../../contexts/BusinessContext';
import styles from './Breadcrumb.module.scss';

const LABELS = {
  admin: 'Console',
  dashboard: 'Dashboard',
  businesses: 'Businesses',
  subscriptions: 'Subscriptions',
  payments: 'Payments',
  users: 'Users',
  support: 'Support',
  notifications: 'Notifications',
  'audit-logs': 'Audit Logs',
  analytics: 'Analytics',
  roles: 'Roles & Permissions',
  settings: 'Platform Settings',
};

export default function Breadcrumb() {
  const location = useLocation();
  const { businesses } = useBusinesses();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <div className={styles.wrap}>
      <Link to="/admin/dashboard" className={styles.homeLink}><FiHome size={13} /></Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        const matchedBusiness = /^BIZ-\d+$/i.test(seg) ? businesses.find((b) => b.id.toLowerCase() === seg.toLowerCase()) : null;
        const label = matchedBusiness ? matchedBusiness.name : LABELS[seg] || (seg.charAt(0).toUpperCase() + seg.slice(1));
        return (
          <span key={path} className={styles.segment}>
            <FiChevronRight size={12} className={styles.chevron} />
            {isLast ? <span className={styles.current}>{label}</span> : <Link to={path} className={styles.link}>{label}</Link>}
          </span>
        );
      })}
    </div>
  );
}

