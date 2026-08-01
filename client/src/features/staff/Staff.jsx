import { useState, useMemo } from 'react';
import { FiPlus, FiSearch, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useStaff } from '../../contexts/StaffContext';
import { initials, formatDate } from '../../utils/format';
import EmptyState from '../../components/common/EmptyState';
import TableSkeleton from '../../components/common/TableSkeleton';
import Button from '../../components/common/Button';
import StaffModal from './components/StaffModal';
import StaffDrawer from './components/StaffDrawer';

export default function Staff() {
  const { staff, roles, loading } = useStaff();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [drawerStaff, setDrawerStaff] = useState(null);

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || s.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staff, search, roleFilter]);

  const openAdd = () => { setEditingStaff(null); setModalOpen(true); };
  const openEdit = (s) => { setDrawerStaff(null); setEditingStaff(s); setModalOpen(true); };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Staff</h1>
          <p>{staff.length} team members managing your business</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openAdd}>Add staff</Button>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search staff by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="All">All roles</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiUserCheck} title="No staff found" message="Try adjusting your search or filter." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Role</th><th>Contact</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setDrawerStaff(s)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                          color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{initials(s.name)}</div>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{s.role}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                    <td>
                      {s.status === 'suspended'
                        ? <span className="badge badge-danger"><FiUserX size={11} /> Suspended</span>
                        : <span className="badge badge-success"><FiUserCheck size={11} /> Active</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(s.joined)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StaffModal open={modalOpen} onClose={() => setModalOpen(false)} staffMember={editingStaff} />
      <StaffDrawer staffMember={drawerStaff} onClose={() => setDrawerStaff(null)} onEdit={openEdit} />
    </div>
  );
}
