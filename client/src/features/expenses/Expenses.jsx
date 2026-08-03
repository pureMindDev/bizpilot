import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FiPlus, FiCreditCard, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { expenseCategories } from '../../data/mockExpenses';
import { formatCurrency, formatDate } from '../../utils/format';
import { extractErrorMessage } from '../../utils/apiError';
import { withId } from '../../utils/normalize';
import api from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import TableSkeleton from '../../components/common/TableSkeleton';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import ExpenseModal from './components/ExpenseModal';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6', '#64748B'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.data.map(withId));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filtered = useMemo(() => expenses.filter((e) => category === 'All' || e.category === category), [expenses, category]);
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  const chartData = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const handleSave = async (data) => {
    if (editing) {
      const res = await api.patch(`/expenses/${editing.id}`, data);
      const updated = withId(res.data.data);
      setExpenses((prev) => prev.map((e) => (e.id === editing.id ? updated : e)));
    } else {
      const res = await api.post('/expenses', data);
      setExpenses((prev) => [withId(res.data.data), ...prev]);
    }
    setEditing(null);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success('Expense deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>Total recorded: {formatCurrency(total)}</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={() => { setEditing(null); setModalOpen(true); }}>Add expense</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginBottom: 16, alignItems: 'start' }} className="expGrid">
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by category</span>
            <select className="form-select" style={{ width: 180 }} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All categories</option>
              {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={FiCreditCard} title="No expenses found" message="Try a different category or add a new expense." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Recorded by</th><th>Amount</th><th></th></tr></thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.description}</td>
                      <td><span className="badge badge-neutral">{e.category}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(e.date)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{e.recordedBy}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>{formatCurrency(e.amount)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-icon" onClick={() => { setEditing(e); setModalOpen(true); }}><FiEdit2 size={14} /></button>
                          <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(e)}><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Expenses by category</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 10 }}>All-time breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={82} paddingAngle={3}>
                {chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {chartData.map((entry, i) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: COLORS[i % COLORS.length] }} /> {entry.name}
                </span>
                <span className="mono" style={{ fontWeight: 600 }}>{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} expense={editing} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete expense?" width={400}
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Delete "<strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.description}</strong>"? This cannot be undone.
        </p>
      </Modal>

      <style>{`@media (max-width: 1000px) { .expGrid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
