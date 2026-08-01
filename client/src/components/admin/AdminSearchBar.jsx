import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBriefcase, FiUsers, FiDollarSign, FiHeadphones, FiCreditCard } from 'react-icons/fi';
import { useBusinesses } from '../../contexts/BusinessContext';
import { usePlatformUsers } from '../../contexts/PlatformUserContext';
import { usePayments } from '../../contexts/PaymentContext';
import { useSupport } from '../../contexts/SupportContext';
import { formatCurrency } from '../../utils/format';
import styles from '../layout/SearchBar.module.scss';

export default function AdminSearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const { businesses } = useBusinesses();
  const { users } = usePlatformUsers();
  const { payments, plans } = usePayments();
  const { tickets } = useSupport();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return {
      businesses: businesses.filter((b) => b.name.toLowerCase().includes(q) || b.owner.toLowerCase().includes(q)).slice(0, 4),
      users: users.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 4),
      payments: payments.filter((p) => p.business.toLowerCase().includes(q) || p.invoiceNo.toLowerCase().includes(q)).slice(0, 4),
      tickets: tickets.filter((t) => t.subject.toLowerCase().includes(q) || t.business.toLowerCase().includes(q)).slice(0, 4),
      plans: plans.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [query, businesses, users, payments, tickets, plans]);

  const hasResults = results && Object.values(results).some((arr) => arr.length > 0);

  const goTo = (path) => { navigate(path); setQuery(''); setFocused(false); };

  return (
    <div className={styles.wrap} ref={ref}>
      <FiSearch size={16} className={styles.icon} />
      <input
        className={styles.input}
        placeholder="Search businesses, users, payments, tickets..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
      />
      <AnimatePresence>
        {focused && query.trim() && (
          <motion.div className={styles.dropdown} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {!hasResults && <div className={styles.empty}>No results for "{query}"</div>}
            {results.businesses.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiBriefcase size={12} /> Businesses</p>
                {results.businesses.map((b) => (
                  <button key={b.id} className={styles.item} onClick={() => goTo('/admin/businesses')}>
                    <span>{b.name}</span><span className={styles.meta}>{b.plan}</span>
                  </button>
                ))}
              </div>
            )}
            {results.users.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiUsers size={12} /> Users</p>
                {results.users.map((u) => (
                  <button key={u.id} className={styles.item} onClick={() => goTo('/admin/users')}>
                    <span>{u.name}</span><span className={styles.meta}>{u.role}</span>
                  </button>
                ))}
              </div>
            )}
            {results.payments.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiDollarSign size={12} /> Payments</p>
                {results.payments.map((p) => (
                  <button key={p.id} className={styles.item} onClick={() => goTo('/admin/payments')}>
                    <span>{p.invoiceNo}</span><span className={styles.meta}>{formatCurrency(p.amount)}</span>
                  </button>
                ))}
              </div>
            )}
            {results.tickets.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiHeadphones size={12} /> Support tickets</p>
                {results.tickets.map((t) => (
                  <button key={t.id} className={styles.item} onClick={() => goTo('/admin/support')}>
                    <span>{t.subject}</span><span className={styles.meta}>{t.status}</span>
                  </button>
                ))}
              </div>
            )}
            {results.plans.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}><FiCreditCard size={12} /> Subscription plans</p>
                {results.plans.map((p) => (
                  <button key={p.id} className={styles.item} onClick={() => goTo('/admin/subscriptions')}>
                    <span>{p.name}</span><span className={styles.meta}>{formatCurrency(p.price)}/mo</span>
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
