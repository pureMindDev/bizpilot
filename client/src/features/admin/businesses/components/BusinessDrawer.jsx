import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiX, FiEdit2, FiTrash2, FiPause, FiPlay, FiMail, FiPhone, FiMapPin, FiUsers, FiBox, FiTrendingUp, FiExternalLink } from 'react-icons/fi';
import { useBusinesses } from '../../../../contexts/BusinessContext';
import { formatCurrency, formatDate, timeAgo, initials } from '../../../../utils/format';
import styles from './BusinessDrawer.module.scss';

const STATUS_TONE = { Active: 'success', Trial: 'info', Expired: 'warning', Suspended: 'danger' };

export default function BusinessDrawer({ business, onClose, onEdit, onDelete }) {
  const { suspendBusiness, activateBusiness } = useBusinesses();

  return (
    <AnimatePresence>
      {business && (
        <>
          <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className={styles.drawer} initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <div className={styles.header}>
              <h3>Business details</h3>
              <button className={styles.closeBtn} onClick={onClose}><FiX size={18} /></button>
            </div>

            <div className={styles.body}>
              <div className={styles.profileTop}>
                <div className={styles.logo}>{initials(business.name)}</div>
                <h2>{business.name}</h2>
                <p className={styles.owner}>Owned by {business.owner}</p>
                <Link to={`/admin/businesses/${business.id}`} onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginBottom: 10 }}>
                  View full profile <FiExternalLink size={11} />
                </Link>
                <div className={styles.badges}>
                  <span className="badge badge-info">{business.plan} plan</span>
                  <span className={`badge badge-${STATUS_TONE[business.status]}`}>{business.status}</span>
                </div>
              </div>

              <div className={styles.contactList}>
                <div className={styles.contactRow}><FiMail size={14} /> {business.email}</div>
                <div className={styles.contactRow}><FiPhone size={14} /> {business.phone}</div>
                <div className={styles.contactRow}><FiMapPin size={14} /> {business.city}</div>
              </div>

              <div className={styles.statsRow}>
                <div>
                  <p className={styles.statLabel}><FiUsers size={12} /> Total users</p>
                  <p className={styles.statValue}>{business.users}</p>
                </div>
                <div>
                  <p className={styles.statLabel}><FiBox size={12} /> Total products</p>
                  <p className={styles.statValue}>{business.products}</p>
                </div>
                <div>
                  <p className={styles.statLabel}><FiTrendingUp size={12} /> Total sales</p>
                  <p className={styles.statValue}>{formatCurrency(business.totalSales)}</p>
                </div>
              </div>

              <div className={styles.detailList}>
                <div className={styles.detailRow}><span>Created</span><strong>{formatDate(business.createdAt)}</strong></div>
                <div className={styles.detailRow}><span>Renewal date</span><strong>{formatDate(business.renewalDate)}</strong></div>
                <div className={styles.detailRow}><span>Business ID</span><strong className="mono">{business.id}</strong></div>
              </div>

              <p className={styles.sectionTitle}>Recent activity</p>
              <div className={styles.timeline}>
                {business.activity.map((a, i) => (
                  <div key={i} className={styles.timelineRow}>
                    <div className={styles.dot} />
                    <div>
                      <p className={styles.actionText}>{a.action}</p>
                      <p className={styles.actionTime}>{timeAgo(a.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              <button className="btn btn-secondary btn-icon" onClick={() => onEdit(business)}><FiEdit2 size={14} /></button>
              {business.status === 'Suspended' ? (
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => activateBusiness(business.id)}>
                  <FiPlay size={14} /> Activate
                </button>
              ) : (
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => suspendBusiness(business.id)}>
                  <FiPause size={14} /> Suspend
                </button>
              )}
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(business)}>
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
