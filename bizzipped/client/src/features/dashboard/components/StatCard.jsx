import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import AnimatedCounter from '../../../components/common/AnimatedCounter';
import styles from './StatCard.module.scss';

export default function StatCard({ label, value, prefix = '', suffix = '', decimals = 0, trend, icon: Icon, tone = 'primary', delay = 0 }) {
  const isUp = trend >= 0;
  return (
    <motion.div
      className={`card ${styles.card}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <div className={`${styles.iconWrap} ${styles[tone]}`}><Icon size={16} /></div>
      </div>
      <div className={styles.value}>
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {trend !== undefined && (
        <div className={`${styles.trend} ${isUp ? styles.up : styles.down}`}>
          {isUp ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </motion.div>
  );
}
