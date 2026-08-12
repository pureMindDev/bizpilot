import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiUsers } from 'react-icons/fi';
import { useCustomers } from '../../contexts/CustomerContext';
import { formatCurrency, initials } from '../../utils/format';
import { extractErrorMessage } from '../../utils/apiError';
import EmptyState from '../../components/common/EmptyState';
import TableSkeleton from '../../components/common/TableSkeleton';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import CustomerModal from './components/CustomerModal';
import CustomerDrawer from './components/CustomerDrawer';

export default function Customers() {
  const { customers, deleteCustomer, loading } = useCustomers();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [drawerCustomer, setDrawerCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || (status === 'Debt' ? c.outstandingDebt > 0 : c.outstandingDebt === 0);
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, status]);

  const openAdd = () => { setEditingCustomer(null); setModalOpen(true); };
  const openEdit = (c) => { setDrawerCustomer(null); setEditingCustomer(c); setModalOpen(true); };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success('Customer removed');
      setDeleteTarget(null);
      setDrawerCustomer(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} customers on record</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openAdd}>Add customer</Button>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All customers</option>
          <option value="Debt">With outstanding debt</option>
          <option value="Clear">No debt</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiUsers} title="No customers found" message="Try adjusting your search, or add a new customer." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Customer</th><th>Contact</th><th>City</th><th>Total purchases</th><th>Debt</th><th>Orders</th></tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setDrawerCustomer(c)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                          color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{initials(c.name)}</div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                    <td>{c.city}</td>
                    <td className="mono">{formatCurrency(c.totalPurchases)}</td>
                    <td>
                      {c.outstandingDebt > 0
                        ? <span className="badge badge-danger">{formatCurrency(c.outstandingDebt)}</span>
                        : <span className="badge badge-success">Clear</span>}
                    </td>
                    <td>{c.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerModal open={modalOpen} onClose={() => setModalOpen(false)} customer={editingCustomer} />
      <CustomerDrawer customer={drawerCustomer} onClose={() => setDrawerCustomer(null)} onEdit={openEdit} onDelete={(c) => setDeleteTarget(c)} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove customer?" subtitle="This action cannot be undone." width={420}
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Remove customer</Button>
        </>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong> from your customer list?
        </p>
      </Modal>
    </div>
  );
}
