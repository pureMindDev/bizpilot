import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiBox, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useProducts } from '../../contexts/ProductContext';
import { formatCurrency } from '../../utils/format';
import { extractErrorMessage } from '../../utils/apiError';
import EmptyState from '../../components/common/EmptyState';
import TableSkeleton from '../../components/common/TableSkeleton';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import ProductModal from './components/ProductModal';
import ProductDrawer from './components/ProductDrawer';

const PAGE_SIZE = 8;

export default function Inventory() {
  const { products, categories, deleteProduct, loading } = useProducts();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditingProduct(null); setModalOpen(true); };
  const openEdit = (p) => { setDrawerProduct(null); setEditingProduct(p); setModalOpen(true); };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      setDrawerProduct(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>{products.length} products across {categories.length} categories</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openAdd}>Add product</Button>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 34 }}
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select" style={{ width: 180 }} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="All">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : pageItems.length === 0 ? (
          <EmptyState icon={FiBox} title="No products found" message="Try adjusting your search or filter, or add a new product." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Cost price</th>
                  <th>Selling price</th>
                  <th>Stock</th>
                  <th>Supplier</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setDrawerProduct(p)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, background: 'var(--bg-hover)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', flexShrink: 0,
                        }}><FiBox size={16} /></div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{p.category}</span></td>
                    <td className="mono">{formatCurrency(p.costPrice)}</td>
                    <td className="mono">{formatCurrency(p.sellingPrice)}</td>
                    <td>
                      {p.stock} {p.stock <= p.reorderLevel && <span className="badge badge-danger" style={{ marginLeft: 6 }}>Low</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.supplier}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(p)}><FiEdit2 size={14} /></button>
                        <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(p)}><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><FiChevronLeft size={15} /></button>
              <button className="btn btn-secondary btn-icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><FiChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} product={editingProduct} />

      <ProductDrawer
        product={drawerProduct}
        onClose={() => setDrawerProduct(null)}
        onEdit={openEdit}
        onDelete={(p) => setDeleteTarget(p)}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete product?"
        subtitle="This action cannot be undone."
        width={420}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete product</Button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong> from your inventory?
        </p>
      </Modal>
    </div>
  );
}
