import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBox, FiUsers, FiShoppingCart, FiUserCheck } from 'react-icons/fi';
import { useProducts } from '../../contexts/ProductContext';
import { useCustomers } from '../../contexts/CustomerContext';
import { useSales } from '../../contexts/SalesContext';
import { useStaff } from '../../contexts/StaffContext';
import { formatCurrency } from '../../utils/format';
import styles from './SearchBar.module.scss';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { sales } = useSales();
  const { staff } = useStaff();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return {
      products: products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 4),
      customers: customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4),
      sales: sales.filter((s) => s.id.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q)).slice(0, 4),
      staff: staff.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [query, products, customers, sales, staff]);

  const hasResults = results && Object.values(results).some((arr) => arr.length > 0);

  const goTo = (path) => {
    navigate(path);
    setQuery('');
    setFocused(false);
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <FiSearch size={16} className={styles.icon} />
      <input
        className={styles.input}
        placeholder="Search products, customers, sales, staff..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
      />
      <AnimatePresence>
        {focused && query.trim() && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {!hasResults && <div className={styles.empty}>No results for "{query}"</div>}
            {results.products.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiBox size={12} /> Products</p>
                {results.products.map((p) => (
                  <button key={p.id} className={styles.item} onClick={() => goTo('/inventory')}>
                    <span>{p.name}</span><span className={styles.meta}>{formatCurrency(p.sellingPrice)}</span>
                  </button>
                ))}
              </div>
            )}
            {results.customers.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiUsers size={12} /> Customers</p>
                {results.customers.map((c) => (
                  <button key={c.id} className={styles.item} onClick={() => goTo('/customers')}>
                    <span>{c.name}</span><span className={styles.meta}>{c.city}</span>
                  </button>
                ))}
              </div>
            )}
            {results.sales.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiShoppingCart size={12} /> Sales</p>
                {results.sales.map((s) => (
                  <button key={s.id} className={styles.item} onClick={() => goTo('/sales')}>
                    <span>{s.id}</span><span className={styles.meta}>{formatCurrency(s.total)}</span>
                  </button>
                ))}
              </div>
            )}
            {results.staff.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiUserCheck size={12} /> Staff</p>
                {results.staff.map((s) => (
                  <button key={s.id} className={styles.item} onClick={() => goTo('/staff')}>
                    <span>{s.name}</span><span className={styles.meta}>{s.role}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
