import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiX, FiEdit2, FiUserX, FiUserCheck, FiMail, FiPhone } from 'react-icons/fi';
import { useStaff } from '../../../contexts/StaffContext';
import { formatDate, timeAgo, initials } from '../../../utils/format';
import { extractErrorMessage } from '../../../utils/apiError';
import styles from './StaffDrawer.module.scss';

export default function StaffDrawer({ staffMember, onClose, onEdit }) {
  const { rolePermissions, suspendStaff } = useStaff();

  const handleSuspend = async () => {
    try {
      await suspendStaff(staffMember.id);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <AnimatePresence>
      {staffMember && (
        <>
          <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className={styles.drawer} initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <div className={styles.header}>
              <h3>Staff profile</h3>
              <button className={styles.closeBtn} onClick={onClose}><FiX size={18} /></button>
            </div>

            <div className={styles.body}>
              <div className={styles.profileTop}>
                <div className={styles.avatarLg}>{initials(staffMember.name)}</div>
                <h2>{staffMember.name}</h2>
                <span className="badge badge-info">{staffMember.role}</span>
                {staffMember.status === 'suspended' && <span className="badge badge-danger" style={{ marginLeft: 6 }}>Suspended</span>}
              </div>

              <div className={styles.contactList}>
                <div className={styles.contactRow}><FiMail size={14} /> {staffMember.email}</div>
                <div className={styles.contactRow}><FiPhone size={14} /> {staffMember.phone}</div>
              </div>

              <p className={styles.sectionTitle}>Permissions</p>
              <div className={styles.permWrap}>
                {rolePermissions[staffMember.role]?.map((p) => <span key={p} className="badge badge-info">{p}</span>)}
              </div>

              <p className={styles.sectionTitle}>Activity timeline</p>
              <div className={styles.timeline}>
                {staffMember.activity?.map((a, i) => (
                  <div key={i} className={styles.timelineRow}>
                    <div className={styles.dot} />
                    <div>
                      <p className={styles.actionText}>{a.action}</p>
                      <p className={styles.actionTime}>{timeAgo(a.time)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className={styles.sectionTitle}>Joined</p>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{formatDate(staffMember.joined)}</p>
            </div>

            <div className={styles.footer}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(staffMember)}>
                <FiEdit2 size={14} /> Edit
              </button>
              <button
                className={staffMember.status === 'suspended' ? 'btn btn-secondary' : 'btn btn-danger'}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleSuspend}
              >
                {staffMember.status === 'suspended' ? <><FiUserCheck size={14} /> Reactivate</> : <><FiUserX size={14} /> Suspend</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
