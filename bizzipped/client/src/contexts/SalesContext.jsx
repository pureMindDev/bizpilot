import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withId } from '../utils/normalize';
import { useProducts } from './ProductContext';
import { useCustomers } from './CustomerContext';
import { useAuth } from './AuthContext';

const SalesContext = createContext();
const PAYMENT_METHODS = ['Cash', 'Transfer', 'POS'];

export function SalesProvider({ children }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const { refetch: refetchProducts } = useProducts();
  const { refetch: refetchCustomers } = useCustomers();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchSales = async () => {
    try {
      const res = await api.get('/sales', { params: { limit: 100 } });
      setSales(res.data.data.map(withId));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setSales([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSales();
  }, [isAuthenticated, authLoading]);

  // Cart is purely client-side, in-progress checkout state — the backend has no concept of it.
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) => (it.productId === product.id ? { ...it, qty: it.qty + 1 } : it));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.sellingPrice, qty: 1, stock: product.stock }];
    });
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) => prev.map((it) => (it.productId === productId ? { ...it, qty } : it)));
  };

  const removeFromCart = (productId) => setCart((prev) => prev.filter((it) => it.productId !== productId));

  const clearCart = () => setCart([]);

  // Completes checkout against the real API — the backend decrements stock and
  // updates customer totals, so we refetch both after a successful sale rather
  // than trying to replicate that logic twice on the client.
  const completeSale = async ({ paymentMethod, discount = 0, customer = 'Walk-in Customer' }) => {
    const res = await api.post('/sales', {
      items: cart.map(({ productId, qty }) => ({ productId, qty })),
      paymentMethod,
      discount,
      customer,
    });
    const sale = withId(res.data.data);
    setSales((prev) => [sale, ...prev]);
    clearCart();
    refetchProducts();
    refetchCustomers();
    return sale;
  };

  return (
    <SalesContext.Provider
      value={{ sales, loading, cart, paymentMethods: PAYMENT_METHODS, addToCart, updateCartQty, removeFromCart, clearCart, completeSale, refetch: fetchSales }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export const useSales = () => useContext(SalesContext);
