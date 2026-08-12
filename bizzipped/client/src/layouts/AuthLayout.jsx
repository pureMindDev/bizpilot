import { motion } from 'framer-motion';
import { FiZap, FiTrendingUp, FiShield, FiUsers } from 'react-icons/fi';
import styles from './AuthLayout.module.scss';

const HIGHLIGHTS = [
  { icon: FiTrendingUp, text: 'Track sales, revenue and profit in real time' },
  { icon: FiUsers, text: 'Manage customers, staff and inventory in one place' },
  { icon: FiShield, text: 'Built for Nigerian SMEs — secure and reliable' },
];

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.brandPanel}>
        <div className={styles.brandMark}>
          <FiZap size={20} /> BizPilot
        </div>
        <div className={styles.brandCopy}>
          <h2>Run your entire business from one dashboard.</h2>
          <p>Inventory, sales, customers, staff and reports — built for the way Nigerian SMEs actually work.</p>
          <ul>
            {HIGHLIGHTS.map((h, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
              >
                <span className={styles.hIcon}><h.icon size={15} /></span>
                {h.text}
              </motion.li>
            ))}
          </ul>
        </div>
        <div className={styles.glow} />
      </div>

      <div className={styles.formPanel}>
        <motion.div
          className={styles.formCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.mobileBrand}><FiZap size={18} /> BizPilot</div>
          <h1>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </div>
  );
}
