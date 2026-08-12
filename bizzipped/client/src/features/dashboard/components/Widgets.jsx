import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPackage, FiUserPlus, FiShoppingBag, FiActivity } from 'react-icons/fi';
import { formatCurrency, timeAgo, initials } from '../../../utils/format';
import ChartCard from './ChartCard';
import styles from './Widgets.module.scss';

export function RecentSalesWidget({ sales, delay }) {
  return (
    <ChartCard title="Recent sales" subtitle="Latest transactions across your store" delay={delay}
      action={<Link to="/sales" className={styles.link}>View all</Link>}>
      <div className={styles.list}>
        {sales.slice(0, 5).map((s) => (
          <div key={s.id} className={styles.row}>
            <div className={styles.rowIcon}><FiShoppingBag size={14} /></div>
            <div className={styles.rowMain}>
              <p className={styles.rowTitle}>{s.customer}</p>
              <p className={styles.rowSub}>{s.items.length} item{s.items.length > 1 ? 's' : ''} · {s.paymentMethod}</p>
            </div>
            <div className={styles.rowEnd}>
              <p className={styles.rowValue}>{formatCurrency(s.total)}</p>
              <p className={styles.rowTime}>{timeAgo(s.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function LowStockWidget({ products, delay }) {
  return (
    <ChartCard title="Low stock products" subtitle="Items at or below reorder level" delay={delay}
      action={<Link to="/inventory" className={styles.link}>Manage</Link>}>
      <div className={styles.list}>
        {products.length === 0 && <p className={styles.emptyMini}>All products are well stocked.</p>}
        {products.slice(0, 5).map((p) => (
          <div key={p.id} className={styles.row}>
            <div className={`${styles.rowIcon} ${styles.warning}`}><FiPackage size={14} /></div>
            <div className={styles.rowMain}>
              <p className={styles.rowTitle}>{p.name}</p>
              <p className={styles.rowSub}>{p.category}</p>
            </div>
            <div className={styles.rowEnd}>
              <span className="badge badge-danger">{p.stock} left</span>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function RecentCustomersWidget({ customers, delay }) {
  return (
    <ChartCard title="Recent customers" subtitle="Newest additions to your customer list" delay={delay}
      action={<Link to="/customers" className={styles.link}>View all</Link>}>
      <div className={styles.list}>
        {customers.slice(0, 5).map((c) => (
          <div key={c.id} className={styles.row}>
            <div className={styles.avatar}>{initials(c.name)}</div>
            <div className={styles.rowMain}>
              <p className={styles.rowTitle}>{c.name}</p>
              <p className={styles.rowSub}>{c.city}</p>
            </div>
            <div className={styles.rowEnd}>
              <p className={styles.rowValue}>{formatCurrency(c.totalPurchases)}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

const ACTIVITIES = [
  { icon: FiShoppingBag, text: 'Precious Etim completed a sale of ₦18,200', time: new Date(Date.now() - 1800000) },
  { icon: FiPackage, text: 'Stock updated for Golden Morn 900g (+40 units)', time: new Date(Date.now() - 5400000) },
  { icon: FiUserPlus, text: 'New customer Blessing Nwosu was added', time: new Date(Date.now() - 10800000) },
  { icon: FiActivity, text: 'Rasheed Bello logged in from a new device', time: new Date(Date.now() - 18000000) },
  { icon: FiShoppingBag, text: 'Kunle Fashola completed a sale of ₦6,750', time: new Date(Date.now() - 32400000) },
];

export function LatestActivitiesWidget({ delay }) {
  return (
    <ChartCard title="Latest activities" subtitle="What's been happening across your team" delay={delay}>
      <div className={styles.timeline}>
        {ACTIVITIES.map((a, i) => (
          <motion.div
            key={i}
            className={styles.timelineRow}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.06, duration: 0.3 }}
          >
            <div className={styles.timelineIcon}><a.icon size={13} /></div>
            <div>
              <p className={styles.timelineText}>{a.text}</p>
              <p className={styles.rowTime}>{timeAgo(a.time)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </ChartCard>
  );
}
