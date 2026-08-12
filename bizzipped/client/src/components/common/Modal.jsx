import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import styles from './Modal.module.scss';

export default function Modal({ open, onClose, title, subtitle, children, width = 520, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          <motion.div
            className={styles.modal}
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.header}>
              <div>
                <h3>{title}</h3>
                {subtitle && <p>{subtitle}</p>}
              </div>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
                <FiX size={18} />
              </button>
            </div>
            <div className={styles.body}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
