import { FiCheck, FiX, FiShield } from 'react-icons/fi';
import { useAdminRoles } from '../../../contexts/AdminRoleContext';
import { initials } from '../../../utils/format';
import EmptyState from '../../../components/common/EmptyState';

export default function RolesPermissions() {
  const { matrix, team, modules, roles, togglePermission, loading } = useAdminRoles();

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Roles & Permissions</h1>
            <p>Manage what each Super Admin team role can access</p>
          </div>
        </div>
        <div className="card" style={{ padding: 40 }}>
          <EmptyState title="Loading permissions..." message="" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Roles & Permissions</h1>
          <p>Manage what each Super Admin team role can access</p>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Admin team</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>{team.length} members with platform console access</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {team.map((member) => (
            <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, border: '1px solid var(--border-soft)', borderRadius: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
                color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{initials(member.name)}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</p>
                <span className="badge badge-info" style={{ marginTop: 3 }}>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {roles.map((role) => (
        <div key={role} className="card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-hover)' }}>
            {role === 'Super Admin' && <FiShield size={14} style={{ color: 'var(--primary)' }} />}
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>{role}</h3>
            {role === 'Super Admin' && <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>— full access, not editable</span>}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Module</th><th style={{ textAlign: 'center' }}>View</th><th style={{ textAlign: 'center' }}>Edit</th><th style={{ textAlign: 'center' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m}>
                    <td style={{ fontWeight: 600 }}>{m}</td>
                    {['view', 'edit', 'delete'].map((key) => (
                      <td key={key} style={{ textAlign: 'center' }}>
                        <button
                          disabled={role === 'Super Admin'}
                          onClick={() => togglePermission(role, m, key)}
                          style={{
                            width: 26, height: 26, borderRadius: 7, border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: matrix[role]?.[m]?.[key] ? 'var(--success-light, #DCFCE7)' : 'var(--bg-hover)',
                            color: matrix[role]?.[m]?.[key] ? '#15803D' : 'var(--text-tertiary)',
                            cursor: role === 'Super Admin' ? 'default' : 'pointer',
                          }}
                        >
                          {matrix[role]?.[m]?.[key] ? <FiCheck size={14} /> : <FiX size={14} />}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
