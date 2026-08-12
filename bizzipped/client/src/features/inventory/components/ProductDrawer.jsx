import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiEdit2, FiTrash2, FiBox, FiTag, FiTruck, FiHash } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../../utils/format';
import styles from './ProductDrawer.module.scss';

export default function ProductDrawer({ product, onClose, onEdit, onDelete }) {
  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={styles.drawer}
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.header}>
              <h3>Product details</h3>
              <button className={styles.closeBtn} onClick={onClose}><FiX size={18} /></button>
            </div>

            <div className={styles.body}>
              <div className={styles.imagePlaceholder}><FiBox size={30} /></div>
              <h2 className={styles.name}>{product.name}</h2>
              <p className={styles.sku}>{product.sku}</p>

              <div className={styles.badges}>
                <span className="badge badge-info">{product.category}</span>
                {product.stock <= product.reorderLevel
                  ? <span className="badge badge-danger">Low stock</span>
                  : <span className="badge badge-success">In stock</span>}
              </div>

              <div className={styles.priceRow}>
                <div>
                  <p className={styles.priceLabel}>Cost price</p>
                  <p className={styles.priceValue}>{formatCurrency(product.costPrice)}</p>
                </div>
                <div>
                  <p className={styles.priceLabel}>Selling price</p>
                  <p className={styles.priceValue}>{formatCurrency(product.sellingPrice)}</p>
                </div>
                <div>
                  <p className={styles.priceLabel}>Margin</p>
                  <p className={styles.priceValue}>{formatCurrency(product.sellingPrice - product.costPrice)}</p>
                </div>
              </div>

              <div className={styles.detailList}>
                <div className={styles.detailRow}>
                  <span><FiBox size={14} /> Stock quantity</span>
                  <strong>{product.stock} units</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiTag size={14} /> Reorder level</span>
                  <strong>{product.reorderLevel} units</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiTruck size={14} /> Supplier</span>
                  <strong>{product.supplier}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiHash size={14} /> Barcode</span>
                  <strong className="mono">{product.barcode}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Date added</span>
                  <strong>{formatDate(product.createdAt)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(product)}>
                <FiEdit2 size={14} /> Edit
              </button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(product)}>
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
