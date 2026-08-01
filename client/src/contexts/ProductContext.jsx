import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';
import { withId, withIds } from '../utils/normalize';
import { productCategories, productSuppliers } from '../data/options';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchProducts = async () => {
    try {
      // limit=100 covers demo-scale catalogs; a business with a larger catalog
      // would need this rewired to server-side pagination.
      const res = await api.get('/products', { params: { limit: 100 } });
      setProducts(withIds(res.data.data));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Wait for auth to resolve, then fetch only once actually authenticated —
  // and re-fetch whenever authentication state flips from false to true
  // (e.g. right after login or email verification completes).
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProducts();
  }, [isAuthenticated, authLoading]);

  const addProduct = async (product) => {
    const res = await api.post('/products', product);
    const created = withId(res.data.data);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id, updates) => {
    const res = await api.patch(`/products/${id}`, updates);
    const updated = withId(res.data.data);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = async (id, delta) => {
    const res = await api.patch(`/products/${id}/stock`, { delta });
    const updated = withId(res.data.data);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.reorderLevel);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        categories: productCategories,
        suppliers: productSuppliers,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        lowStockProducts,
        refetch: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
