import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import { useSales } from '../../../contexts/SalesContext';
import { formatCurrency, formatDate, initials } from '../../../utils/format';
import styles from './CustomerDrawer.module.scss';

export default function CustomerDrawer({ customer, onClose, onEdit, onDelete }) {
  const { sales } = useSales();
  const orders = customer ? sales.filter((s) => s.customer === customer.name).slice(0, 6) : [];

  return (
    <AnimatePresence>
      {customer && (
        <>
          <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className={styles.drawer} initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <div className={styles.header}>
              <h3>Customer profile</h3>
              <button className={styles.closeBtn} onClick={onClose}><FiX size={18} /></button>
            </div>

            <div className={styles.body}>
              <div className={styles.profileTop}>
                <div className={styles.avatarLg}>{initials(customer.name)}</div>
                <h2>{customer.name}</h2>
                <p className={styles.id}>{customer.id}</p>
              </div>

              <div className={styles.contactList}>
                <div className={styles.contactRow}><FiMail size={14} /> {customer.email}</div>
                <div className={styles.contactRow}><FiPhone size={14} /> {customer.phone}</div>
                <div className={styles.contactRow}><FiMapPin size={14} /> {customer.city}</div>
              </div>

              <div className={styles.statsRow}>
                <div>
                  <p className={styles.statLabel}>Total purchases</p>
                  <p className={styles.statValue}>{formatCurrency(customer.totalPurchases)}</p>
                </div>
                <div>
                  <p className={styles.statLabel}>Outstanding debt</p>
                  <p className={styles.statValue} style={{ color: customer.outstandingDebt > 0 ? '#EF4444' : undefined }}>
                    {formatCurrency(customer.outstandingDebt)}
                  </p>
                </div>
                <div>
                  <p className={styles.statLabel}>Orders</p>
                  <p className={styles.statValue}>{customer.orders}</p>
                </div>
              </div>

              {customer.notes && (
                <div className={styles.notesBox}>
                  <p className={styles.notesLabel}>Customer notes</p>
                  <p className={styles.notesText}>{customer.notes}</p>
                </div>
              )}

              <p className={styles.sectionTitle}>Recent orders</p>
              <div className={styles.orderList}>
                {orders.length === 0 && <p className={styles.emptyMini}>No recorded orders yet.</p>}
                {orders.map((o) => (
                  <div key={o.id} className={styles.orderRow}>
                    <div className={styles.orderIcon}><FiShoppingBag size={13} /></div>
                    <div style={{ flex: 1 }}>
                      <p className={styles.orderId}>{o.id}</p>
                      <p className={styles.orderDate}>{formatDate(o.createdAt)}</p>
                    </div>
                    <p className={styles.orderTotal}>{formatCurrency(o.total)}</p>
                  </div>
                ))}
              </div>

              <p className={styles.sectionTitle}>Customer since</p>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{formatDate(customer.joined)}</p>
            </div>

            <div className={styles.footer}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(customer)}>
                <FiEdit2 size={14} /> Edit
              </button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(customer)}>
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
