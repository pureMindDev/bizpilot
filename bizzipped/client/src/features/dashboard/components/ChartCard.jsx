import { motion } from 'framer-motion';
import styles from './ChartCard.module.scss';

export default function ChartCard({ title, subtitle, action, children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={`card ${styles.card} ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.header}>
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}
