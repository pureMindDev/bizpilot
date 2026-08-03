import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiUsers, FiUserCheck, FiUserX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { usePlatformUsers } from '../../../contexts/PlatformUserContext';
import { initials, formatDate } from '../../../utils/format';
import { extractErrorMessage } from '../../../utils/apiError';
import EmptyState from '../../../components/common/EmptyState';
import TableSkeleton from '../../../components/common/TableSkeleton';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import UserDrawer from './components/UserDrawer';

const PAGE_SIZE = 8;
const ROLES = ['Owner', 'Manager', 'Cashier', 'Sales Rep', 'Inventory Officer'];

export default function PlatformUsers() {
  const { users, suspendUser, deleteUser, loading } = usePlatformUsers();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [page, setPage] = useState(1);
  const [drawerUser, setDrawerUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.business.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role === 'All' || u.role === role;
      return matchesSearch && matchesRole;
    });
  }, [users, search, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSuspend = async (u) => {
    try {
      await suspendUser(u.id);
      toast.success(u.status === 'suspended' ? `${u.name} activated` : `${u.name} suspended`);
      setDrawerUser(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      setDrawerUser(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Platform Users</h1>
          <p>{users.length} users across all businesses</p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search by name or business..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="All">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : pageItems.length === 0 ? (
          <EmptyState icon={FiUsers} title="No users found" message="Try adjusting your search or filter." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Business</th><th>Role</th><th>Contact</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {pageItems.map((u) => (
                  <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => setDrawerUser(u)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                          color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{initials(u.name)}</div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.business}</td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      {u.status === 'suspended'
                        ? <span className="badge badge-danger"><FiUserX size={11} /> Suspended</span>
                        : <span className="badge badge-success"><FiUserCheck size={11} /> Active</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(u.createdAt)}</td>
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

      <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onSuspend={handleSuspend} onDelete={(u) => setDeleteTarget(u)} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete user?" subtitle="This action cannot be undone." width={400}
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete user</Button>
        </>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong> from the platform?
        </p>
      </Modal>
    </div>
  );
}
