import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiSearch, FiArrowUp, FiArrowDown, FiXCircle, FiClock } from 'react-icons/fi';
import { usePayments } from '../../../contexts/PaymentContext';
import { useBusinesses } from '../../../contexts/BusinessContext';
import { formatCurrency, formatDate } from '../../../utils/format';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

const STATUS_TONE = { Active: 'success', Trial: 'info', Expired: 'warning', Suspended: 'danger' };

export default function Subscriptions() {
  const { plans } = usePayments();
  const { businesses, updateBusiness } = useBusinesses();
  const [search, setSearch] = useState('');
  const [changeTarget, setChangeTarget] = useState(null);
  const [changeAction, setChangeAction] = useState('');

  const filtered = useMemo(
    () => businesses.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [businesses, search]
  );

  const planIndex = (name) => plans.findIndex((p) => p.name === name);

  const openChange = (business, action) => { setChangeTarget(business); setChangeAction(action); };

  const confirmChange = () => {
    if (changeAction === 'upgrade') {
      const next = plans[Math.min(planIndex(changeTarget.plan) + 1, plans.length - 1)];
      updateBusiness(changeTarget.id, { plan: next.name });
      toast.success(`${changeTarget.name} upgraded to ${next.name}`);
    } else if (changeAction === 'downgrade') {
      const prev = plans[Math.max(planIndex(changeTarget.plan) - 1, 0)];
      updateBusiness(changeTarget.id, { plan: prev.name });
      toast.success(`${changeTarget.name} downgraded to ${prev.name}`);
    } else if (changeAction === 'cancel') {
      updateBusiness(changeTarget.id, { status: 'Expired' });
      toast.success(`Subscription cancelled for ${changeTarget.name}`);
    } else if (changeAction === 'trial') {
      updateBusiness(changeTarget.id, { status: 'Trial', renewalDate: new Date(Date.now() + 14 * 86400000).toISOString() });
      toast.success(`${changeTarget.name} moved to a 14-day trial`);
    }
    setChangeTarget(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Subscriptions</h1>
          <p>Manage platform plans and business subscriptions</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {plans.map((plan) => (
          <div key={plan.id} className="card" style={{ padding: 22, borderTop: `3px solid ${plan.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{plan.name}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {businesses.filter((b) => b.plan === plan.name).length} businesses
                </p>
              </div>
              <Button variant="secondary" size="sm">Edit plan</Button>
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>
              {formatCurrency(plan.price)}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)' }}>/{plan.interval}</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '14px 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <span>Up to {plan.userLimit} users</span>
              <span>Up to {plan.productLimit.toLocaleString()} products</span>
              <span>{plan.storageLimit} storage</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  <FiCheck size={13} style={{ color: plan.color, flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 340 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search business subscriptions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Business</th><th>Plan</th><th>Status</th><th>Renewal date</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td><span className="badge badge-info">{b.plan}</span></td>
                  <td><span className={`badge badge-${STATUS_TONE[b.status]}`}>{b.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(b.renewalDate)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" disabled={planIndex(b.plan) >= plans.length - 1} onClick={() => openChange(b, 'upgrade')}><FiArrowUp size={12} /> Upgrade</button>
                      <button className="btn btn-ghost btn-sm" disabled={planIndex(b.plan) <= 0} onClick={() => openChange(b, 'downgrade')}><FiArrowDown size={12} /> Downgrade</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openChange(b, 'trial')}><FiClock size={12} /> Trial</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openChange(b, 'cancel')}><FiXCircle size={12} /> Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!changeTarget} onClose={() => setChangeTarget(null)} title="Confirm subscription change" width={420}
        footer={<>
          <Button variant="secondary" onClick={() => setChangeTarget(null)}>Cancel</Button>
          <Button variant="primary" onClick={confirmChange}>Confirm</Button>
        </>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {changeAction === 'upgrade' && <>Upgrade <strong style={{ color: 'var(--text-primary)' }}>{changeTarget?.name}</strong> to the next plan tier?</>}
          {changeAction === 'downgrade' && <>Downgrade <strong style={{ color: 'var(--text-primary)' }}>{changeTarget?.name}</strong> to the previous plan tier?</>}
          {changeAction === 'trial' && <>Move <strong style={{ color: 'var(--text-primary)' }}>{changeTarget?.name}</strong> to a 14-day trial period?</>}
          {changeAction === 'cancel' && <>Cancel the subscription for <strong style={{ color: 'var(--text-primary)' }}>{changeTarget?.name}</strong>? Their account will be marked as expired.</>}
        </p>
      </Modal>
    </div>
  );
}
