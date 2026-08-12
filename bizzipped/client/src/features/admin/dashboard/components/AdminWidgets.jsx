import { Link } from 'react-router-dom';
import { FiBriefcase, FiDollarSign, FiHeadphones, FiActivity, FiUserPlus, FiCreditCard, FiShield } from 'react-icons/fi';
import { formatCurrency, timeAgo, initials } from '../../../../utils/format';
import ChartCard from '../../../dashboard/components/ChartCard';
import styles from '../../../dashboard/components/Widgets.module.scss';

export function LatestBusinessesWidget({ businesses, delay }) {
  return (
    <ChartCard title="Latest businesses" subtitle="Newest sign-ups on the platform" delay={delay}
      action={<Link to="/admin/businesses" className={styles.link}>View all</Link>}>
      <div className={styles.list}>
        {businesses.slice(0, 5).map((b) => (
          <div key={b.id} className={styles.row}>
            <div className={styles.avatar}>{initials(b.name)}</div>
            <div className={styles.rowMain}>
              <p className={styles.rowTitle}>{b.name}</p>
              <p className={styles.rowSub}>{b.plan} plan · {b.city}</p>
            </div>
            <div className={styles.rowEnd}>
              <span className={`badge badge-${b.status === 'Active' ? 'success' : b.status === 'Trial' ? 'info' : b.status === 'Suspended' ? 'danger' : 'warning'}`}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function RecentPaymentsWidget({ payments, delay }) {
  return (
    <ChartCard title="Recent payments" subtitle="Latest platform-wide transactions" delay={delay}
      action={<Link to="/admin/payments" className={styles.link}>View all</Link>}>
      <div className={styles.list}>
        {payments.slice(0, 5).map((p) => (
          <div key={p.id} className={styles.row}>
            <div className={styles.rowIcon}><FiCreditCard size={14} /></div>
            <div className={styles.rowMain}>
              <p className={styles.rowTitle}>{p.business}</p>
              <p className={styles.rowSub}>{p.plan} · {p.method}</p>
            </div>
            <div className={styles.rowEnd}>
              <p className={styles.rowValue}>{formatCurrency(p.amount)}</p>
              <p className={styles.rowTime}>{timeAgo(p.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function RecentTicketsWidget({ tickets, delay }) {
  return (
    <ChartCard title="Recent support tickets" subtitle="Latest requests from businesses" delay={delay}
      action={<Link to="/admin/support" className={styles.link}>View all</Link>}>
      <div className={styles.list}>
        {tickets.slice(0, 5).map((t) => (
          <div key={t.id} className={styles.row}>
            <div className={`${styles.rowIcon} ${t.priority === 'Urgent' || t.priority === 'High' ? styles.warning : ''}`}><FiHeadphones size={14} /></div>
            <div className={styles.rowMain}>
              <p className={styles.rowTitle}>{t.subject}</p>
              <p className={styles.rowSub}>{t.business}</p>
            </div>
            <div className={styles.rowEnd}>
              <span className="badge badge-neutral">{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

const ACTIVITIES = [
  { icon: FiUserPlus, text: 'Ilorin Shoe Palace signed up for the Growth plan', time: new Date(Date.now() - 1800000) },
  { icon: FiDollarSign, text: 'Abuja Tech Solutions upgraded to Enterprise', time: new Date(Date.now() - 5400000) },
  { icon: FiShield, text: 'Suspicious login blocked for Kano Traders Ltd', time: new Date(Date.now() - 10800000) },
  { icon: FiBriefcase, text: 'Sokoto Provisions was auto-suspended (expired plan)', time: new Date(Date.now() - 18000000) },
  { icon: FiActivity, text: 'Platform maintenance completed successfully', time: new Date(Date.now() - 32400000) },
];

export function PlatformActivityWidget({ delay }) {
  return (
    <ChartCard title="Recent activities" subtitle="Platform-wide event feed" delay={delay}>
      <div className={styles.timeline}>
        {ACTIVITIES.map((a, i) => (
          <div key={i} className={styles.timelineRow}>
            <div className={styles.timelineIcon}><a.icon size={13} /></div>
            <div>
              <p className={styles.timelineText}>{a.text}</p>
              <p className={styles.rowTime}>{timeAgo(a.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
