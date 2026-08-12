import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiX, FiSend, FiUser } from 'react-icons/fi';
import { useSupport } from '../../../../contexts/SupportContext';
import { useAdminAuth } from '../../../../contexts/AdminAuthContext';
import { timeAgo } from '../../../../utils/format';
import { extractErrorMessage } from '../../../../utils/apiError';
import styles from './TicketDrawer.module.scss';

const PRIORITY_TONE = { Low: 'neutral', Medium: 'info', High: 'warning', Urgent: 'danger' };
const STATUS_TONE = { Open: 'info', 'In Progress': 'warning', Resolved: 'success', Closed: 'neutral' };

export default function TicketDrawer({ ticket, onClose }) {
  const { agents, assignTicket, resolveTicket, closeTicket, addComment } = useSupport();
  const { admin } = useAdminAuth();
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await addComment(ticket.id, { author: admin?.name || 'Support', text: comment.trim(), internal: false });
      setComment('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async (agent) => {
    try {
      await assignTicket(ticket.id, agent);
      toast.success('Ticket assigned');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleResolve = async () => {
    try {
      await resolveTicket(ticket.id);
      toast.success('Ticket marked resolved');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleClose = async () => {
    try {
      await closeTicket(ticket.id);
      toast.success('Ticket closed');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <AnimatePresence>
      {ticket && (
        <>
          <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className={styles.drawer} initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <div className={styles.header}>
              <div>
                <h3>{ticket.subject}</h3>
                <p className={styles.ticketId}>{ticket.id} · {ticket.business}</p>
              </div>
              <button className={styles.closeBtn} onClick={onClose}><FiX size={18} /></button>
            </div>

            <div className={styles.badgeRow}>
              <span className={`badge badge-${PRIORITY_TONE[ticket.priority]}`}>{ticket.priority} priority</span>
              <span className={`badge badge-${STATUS_TONE[ticket.status]}`}>{ticket.status}</span>
            </div>

            <div className={styles.controlRow}>
              <select className="form-select" value={ticket.assignedTo} onChange={(e) => handleAssign(e.target.value)}>
                {agents.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <button className="btn btn-secondary btn-sm" onClick={handleResolve}>Resolve</button>
              <button className="btn btn-ghost btn-sm" onClick={handleClose}>Close</button>
            </div>

            <div className={styles.comments}>
              {ticket.comments.map((c, i) => (
                <div key={i} className={styles.comment}>
                  <div className={styles.commentIcon}><FiUser size={13} /></div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentHead}>
                      <strong>{c.author}</strong>
                      <span>{timeAgo(c.time)}</span>
                    </div>
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <input
                className="form-input"
                placeholder="Write a reply..."
                value={comment}
                disabled={sending}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={sending}><FiSend size={15} /></button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
