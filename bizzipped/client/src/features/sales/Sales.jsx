import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiBox } from 'react-icons/fi';
import { useProducts } from '../../contexts/ProductContext';
import { useSales } from '../../contexts/SalesContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import EmptyState from '../../components/common/EmptyState';
import TableSkeleton from '../../components/common/TableSkeleton';
import CheckoutModal from './components/CheckoutModal';
import styles from './Sales.module.scss';

export default function Sales() {
  const { products, categories } = useProducts();
  const { cart, addToCart, updateCartQty, removeFromCart, sales, loading: historyLoading } = useSales();
  const [tab, setTab] = useState('pos');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || p.category === category;
      return matchesSearch && matchesCategory && p.stock > 0;
    });
  }, [products, search, category]);

  const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Sales</h1>
          <p>Point of sale and transaction history</p>
        </div>
        <div className={styles.tabs}>
          <button className={tab === 'pos' ? styles.tabActive : styles.tab} onClick={() => setTab('pos')}>Point of Sale</button>
          <button className={tab === 'history' ? styles.tabActive : styles.tab} onClick={() => setTab('history')}>Sales History</button>
        </div>
      </div>

      {tab === 'pos' ? (
        <div className={styles.posLayout}>
          <div>
            <div className="card" style={{ padding: 14, marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="form-select" style={{ width: 170 }} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="All">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="card"><EmptyState icon={FiBox} title="No products found" message="Try a different search term or category." /></div>
            ) : (
              <div className={styles.productGrid}>
                {filteredProducts.map((p) => (
                  <motion.button
                    key={p.id}
                    className={`card ${styles.productCard}`}
                    onClick={() => addToCart(p)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className={styles.productIcon}><FiBox size={18} /></div>
                    <p className={styles.productName}>{p.name}</p>
                    <p className={styles.productPrice}>{formatCurrency(p.sellingPrice)}</p>
                    <p className={styles.productStock}>{p.stock} in stock</p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <div className={`card ${styles.cartPanel}`}>
            <div className={styles.cartHeader}>
              <FiShoppingCart size={16} />
              <span>Cart</span>
              <span className={styles.cartCount}>{cart.length}</span>
            </div>

            <div className={styles.cartItems}>
              {cart.length === 0 && <p className={styles.cartEmpty}>Tap a product to add it to the cart.</p>}
              {cart.map((it) => (
                <div key={it.productId} className={styles.cartItem}>
                  <div className={styles.cartItemMain}>
                    <p className={styles.cartItemName}>{it.name}</p>
                    <p className={styles.cartItemPrice}>{formatCurrency(it.price)} each</p>
                  </div>
                  <div className={styles.qtyControls}>
                    <button onClick={() => updateCartQty(it.productId, it.qty - 1)}><FiMinus size={12} /></button>
                    <span>{it.qty}</span>
                    <button onClick={() => updateCartQty(it.productId, it.qty + 1)}><FiPlus size={12} /></button>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(it.productId)}><FiTrash2 size={13} /></button>
                </div>
              ))}
            </div>

            <div className={styles.cartFooter}>
              <div className={styles.cartTotalRow}>
                <span>Subtotal</span>
                <span className="mono">{formatCurrency(subtotal)}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                disabled={cart.length === 0} onClick={() => setCheckoutOpen(true)}>
                Proceed to checkout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          {historyLoading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : sales.length === 0 ? (
            <EmptyState icon={FiShoppingCart} title="No sales yet" message="Completed sales will appear here." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sale ID</th><th>Customer</th><th>Items</th><th>Payment</th><th>Cashier</th><th>Date</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="mono">{s.id}</td>
                      <td>{s.customer}</td>
                      <td>{s.items.length}</td>
                      <td><span className="badge badge-info">{s.paymentMethod}</span></td>
                      <td>{s.cashier}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDateTime(s.createdAt)}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>{formatCurrency(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
