import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch, FiBriefcase, FiEye, FiEdit2, FiTrash2, FiPause, FiPlay, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useBusinesses } from '../../../contexts/BusinessContext';
import { formatCurrency, formatDate, initials } from '../../../utils/format';
import { extractErrorMessage } from '../../../utils/apiError';
import EmptyState from '../../../components/common/EmptyState';
import TableSkeleton from '../../../components/common/TableSkeleton';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import BusinessModal from './components/BusinessModal';
import BusinessDrawer from './components/BusinessDrawer';

const PAGE_SIZE = 8;
const STATUS_TONE = { Active: 'success', Trial: 'info', Expired: 'warning', Suspended: 'danger' };

export default function Businesses() {
  const { businesses, plans, statuses, suspendBusiness, activateBusiness, deleteBusiness, loading } = useBusinesses();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerBusiness, setDrawerBusiness] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.owner.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = plan === 'All' || b.plan === plan;
      const matchesStatus = status === 'All' || b.status === status;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [businesses, search, plan, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (b) => { setDrawerBusiness(null); setEditingBusiness(b); setModalOpen(true); };

  const confirmDelete = async () => {
    try {
      await deleteBusiness(deleteTarget.id);
      toast.success('Business deleted');
      setDeleteTarget(null);
      setDrawerBusiness(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const toggleStatus = async (b) => {
    try {
      if (b.status === 'Suspended') { await activateBusiness(b.id); toast.success(`${b.name} activated`); }
      else { await suspendBusiness(b.id); toast.success(`${b.name} suspended`); }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Businesses</h1>
          <p>{businesses.length} businesses on the platform</p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search by business or owner name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }}>
          <option value="All">All plans</option>
          {plans.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="form-select" style={{ width: 160 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="All">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} columns={8} />
        ) : pageItems.length === 0 ? (
          <EmptyState icon={FiBriefcase} title="No businesses found" message="Try adjusting your search or filters." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Business</th><th>Owner</th><th>Plan</th><th>Status</th><th>Users</th><th>Total sales</th><th>Created</th><th></th></tr>
              </thead>
              <tbody>
                {pageItems.map((b) => (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setDrawerBusiness(b)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
                          color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{initials(b.name)}</div>
                        <span style={{ fontWeight: 600 }}>{b.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.owner}</td>
                    <td><span className="badge badge-info">{b.plan}</span></td>
                    <td><span className={`badge badge-${STATUS_TONE[b.status]}`}>{b.status}</span></td>
                    <td>{b.users}</td>
                    <td className="mono">{formatCurrency(b.totalSales)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(b.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/admin/businesses/${b.id}`)}><FiEye size={14} /></button>
                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(b)}><FiEdit2 size={14} /></button>
                        <button className="btn btn-ghost btn-icon" onClick={() => toggleStatus(b)}>
                          {b.status === 'Suspended' ? <FiPlay size={14} /> : <FiPause size={14} />}
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(b)}><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
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

      <BusinessModal open={modalOpen} onClose={() => setModalOpen(false)} business={editingBusiness} />
      <BusinessDrawer business={drawerBusiness} onClose={() => setDrawerBusiness(null)} onEdit={openEdit} onDelete={(b) => setDeleteTarget(b)} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete business?" subtitle="This action cannot be undone." width={420}
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete business</Button>
        </>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong> and all of its data?
        </p>
      </Modal>
    </div>
  );
}
