import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiUserX, FiUserCheck, FiTrash2, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi';
import { formatDate, initials } from '../../../../utils/format';

export default function UserDrawer({ user, onClose, onSuspend, onDelete }) {
  return (
    <AnimatePresence>
      {user && (
        <>
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.45)', zIndex: 300 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          />
          <motion.div
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, maxWidth: '92vw',
              background: 'var(--bg-card)', zIndex: 301, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
            }}
            initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border-soft)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>User profile</h3>
              <button onClick={onClose} style={{ background: 'var(--bg-hover)', border: 'none', width: 30, height: 30, borderRadius: '50%', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={18} />
              </button>
            </div>

            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                  color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                }}>{initials(user.name)}</div>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>{user.name}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                  <span className="badge badge-info">{user.role}</span>
                  {user.status === 'suspended'
                    ? <span className="badge badge-danger">Suspended</span>
                    : <span className="badge badge-success">Active</span>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMail size={14} /> {user.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiPhone size={14} /> {user.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiBriefcase size={14} /> {user.business}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-soft)', fontSize: 13.5 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Joined</span>
                <strong>{formatDate(user.createdAt)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-soft)', fontSize: 13.5 }}>
                <span style={{ color: 'var(--text-secondary)' }}>User ID</span>
                <strong className="mono">{user.id}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '16px 20px', borderTop: '1px solid var(--border-soft)' }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onSuspend(user)}>
                {user.status === 'suspended' ? <><FiUserCheck size={14} /> Activate</> : <><FiUserX size={14} /> Suspend</>}
              </button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(user)}>
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
