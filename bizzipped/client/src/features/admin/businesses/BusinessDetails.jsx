import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiMail, FiPhone, FiMapPin, FiUsers, FiBox, FiTrendingUp,
  FiEdit2, FiPause, FiPlay, FiTrash2, FiCalendar, FiCreditCard,
} from 'react-icons/fi';
import { useBusinesses } from '../../../contexts/BusinessContext';
import { usePayments } from '../../../contexts/PaymentContext';
import { formatCurrency, formatDate, timeAgo, initials } from '../../../utils/format';
import { extractErrorMessage } from '../../../utils/apiError';
import EmptyState from '../../../components/common/EmptyState';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import BusinessModal from './components/BusinessModal';
import { useState } from 'react';

const STATUS_TONE = { Active: 'success', Trial: 'info', Expired: 'warning', Suspended: 'danger' };

export default function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businesses, suspendBusiness, activateBusiness, deleteBusiness } = useBusinesses();
  const { payments } = usePayments();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const business = businesses.find((b) => b.id === id);
  const businessPayments = business ? payments.filter((p) => p.businessId === business.id) : [];

  if (!business) {
    return (
      <div className="page-container">
        <EmptyState title="Business not found" message="This business may have been deleted or the link is incorrect."
          action={<Button variant="secondary" icon={FiArrowLeft} onClick={() => navigate('/admin/businesses')}>Back to businesses</Button>} />
      </div>
    );
  }

  const confirmDelete = async () => {
    try {
      await deleteBusiness(business.id);
      toast.success('Business deleted');
      navigate('/admin/businesses');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const toggleStatus = async () => {
    try {
      if (business.status === 'Suspended') { await activateBusiness(business.id); toast.success(`${business.name} activated`); }
      else { await suspendBusiness(business.id); toast.success(`${business.name} suspended`); }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <Link to="/admin/businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>
        <FiArrowLeft size={14} /> Back to businesses
      </Link>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14, background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
            color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{initials(business.name)}</div>
          <div>
            <h1>{business.name}</h1>
            <p>Owned by {business.owner} · {business.id}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={FiEdit2} onClick={() => setEditOpen(true)}>Edit</Button>
          <Button variant="secondary" icon={business.status === 'Suspended' ? FiPlay : FiPause} onClick={toggleStatus}>
            {business.status === 'Suspended' ? 'Activate' : 'Suspend'}
          </Button>
          <Button variant="danger" icon={FiTrash2} onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }} className="bizDetailGrid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span className="badge badge-info">{business.plan} plan</span>
              <span className={`badge badge-${STATUS_TONE[business.status]}`}>{business.status}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMail size={14} /> {business.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiPhone size={14} /> {business.phone}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMapPin size={14} /> {business.city}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiCalendar size={14} /> Created {formatDate(business.createdAt)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiCreditCard size={14} /> Renews {formatDate(business.renewalDate)}</div>
            </div>
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Usage overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <StatRow icon={FiUsers} label="Total users" value={business.users} />
              <StatRow icon={FiBox} label="Total products" value={business.products} />
              <StatRow icon={FiTrendingUp} label="Total sales" value={formatCurrency(business.totalSales)} />
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }} style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Recent activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {business.activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{a.action}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{timeAgo(a.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.11 }} style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Payment history</h3>
            {businessPayments.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No payments recorded for this business yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Invoice</th><th>Method</th><th>Status</th><th>Date</th><th>Amount</th></tr></thead>
                  <tbody>
                    {businessPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="mono">{p.invoiceNo}</td>
                        <td>{p.method}</td>
                        <td><span className={`badge badge-${p.status === 'Paid' ? 'success' : p.status === 'Pending' ? 'warning' : p.status === 'Failed' ? 'danger' : 'neutral'}`}>{p.status}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatDate(p.date)}</td>
                        <td className="mono" style={{ fontWeight: 700 }}>{formatCurrency(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <BusinessModal open={editOpen} onClose={() => setEditOpen(false)} business={business} />

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete business?" subtitle="This action cannot be undone." width={420}
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete business</Button>
        </>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>{business.name}</strong> and all of its data?
        </p>
      </Modal>

      <style>{`@media (max-width: 1000px) { .bizDetailGrid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function StatRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><Icon size={14} /> {label}</span>
      <strong style={{ fontSize: 14 }}>{value}</strong>
    </div>
  );
}
