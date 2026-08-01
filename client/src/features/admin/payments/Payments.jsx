import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiSearch, FiDownload, FiFileText, FiRotateCcw, FiEye } from 'react-icons/fi';
import { usePayments } from '../../../contexts/PaymentContext';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { getRevenueGrowth } from '../dashboard/adminDashboardUtils';
import EmptyState from '../../../components/common/EmptyState';
import TableSkeleton from '../../../components/common/TableSkeleton';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import ChartCard from '../../dashboard/components/ChartCard';

const STATUS_TONE = { Paid: 'success', Pending: 'warning', Failed: 'danger', Refunded: 'neutral' };

export default function Payments() {
  const { payments, methods, statuses, refundPayment, totalRevenue } = usePayments();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [method, setMethod] = useState('All');
  const [viewing, setViewing] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch = p.business.toLowerCase().includes(search.toLowerCase()) || p.invoiceNo.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || p.status === status;
      const matchesMethod = method === 'All' || p.method === method;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, status, method]);

  const revenueData = useMemo(() => getRevenueGrowth(payments), [payments]);

  const confirmRefund = () => {
    refundPayment(refundTarget.id);
    toast.success(`Refund processed for ${refundTarget.invoiceNo}`);
    setRefundTarget(null);
  };

  const simulateExport = (format) => toast.success(`Payment report exported as ${format}`);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Total revenue collected: {formatCurrency(totalRevenue)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => simulateExport('PDF')}><FiFileText size={14} /> Export PDF</button>
          <button className="btn btn-secondary" onClick={() => simulateExport('Excel')}><FiDownload size={14} /> Export Excel</button>
        </div>
      </div>

      <ChartCard title="Revenue analytics" subtitle="Monthly platform revenue" delay={0}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} margin={{ left: -18, top: 6 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
            <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="card" style={{ padding: 16, margin: '16px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search by business or invoice number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 170 }} value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="All">All methods</option>
          {methods.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} columns={8} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiFileText} title="No payments found" message="Try adjusting your search or filters." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Invoice</th><th>Business</th><th>Plan</th><th>Method</th><th>Status</th><th>Date</th><th>Amount</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.invoiceNo}</td>
                    <td style={{ fontWeight: 600 }}>{p.business}</td>
                    <td><span className="badge badge-info">{p.plan}</span></td>
                    <td>{p.method}</td>
                    <td><span className={`badge badge-${STATUS_TONE[p.status]}`}>{p.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDateTime(p.date)}</td>
                    <td className="mono" style={{ fontWeight: 700 }}>{formatCurrency(p.amount)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => setViewing(p)}><FiEye size={14} /></button>
                        <button className="btn btn-ghost btn-icon" disabled={p.status !== 'Paid'} onClick={() => setRefundTarget(p)}><FiRotateCcw size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Invoice" subtitle={viewing?.invoiceNo} width={400}
        footer={<Button variant="secondary" onClick={() => window.print()}><FiFileText size={14} /> Print invoice</Button>}>
        {viewing && (
          <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Business</span><strong>{viewing.business}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Plan</span><strong>{viewing.plan}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment method</span><strong>{viewing.method}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Date</span><strong>{formatDateTime(viewing.date)}</strong>
            </div>
            <div style={{ borderTop: '1px dashed var(--border)', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
              <span>Total</span><span className="mono">{formatCurrency(viewing.amount)}</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!refundTarget} onClose={() => setRefundTarget(null)} title="Process refund?" width={400}
        footer={<>
          <Button variant="secondary" onClick={() => setRefundTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmRefund}>Refund {refundTarget && formatCurrency(refundTarget.amount)}</Button>
        </>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          This will simulate refunding <strong style={{ color: 'var(--text-primary)' }}>{refundTarget?.invoiceNo}</strong> to {refundTarget?.business}.
        </p>
      </Modal>
    </div>
  );
}
