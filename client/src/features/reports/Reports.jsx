import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDownload, FiFileText, FiTrendingUp, FiDollarSign, FiTrendingDown } from 'react-icons/fi';
import { useSales } from '../../contexts/SalesContext';
import { mockExpenses } from '../../data/mockExpenses';
import { formatCurrency } from '../../utils/format';
import { getRevenueOverview, getTopProducts } from '../dashboard/dashboardUtils';
import StatCard from '../dashboard/components/StatCard';
import ChartCard from '../dashboard/components/ChartCard';

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export default function Reports() {
  const { sales } = useSales();
  const [period, setPeriod] = useState('Monthly');

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const revenueOverview = useMemo(() => getRevenueOverview(sales), [sales]);
  const topProducts = useMemo(() => getTopProducts(sales), [sales]);

  const topCustomers = useMemo(() => {
    const totals = {};
    sales.forEach((s) => { totals[s.customer] = (totals[s.customer] || 0) + s.total; });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [sales]);

  const simulateExport = (format) => {
    toast.success(`${period} report exported as ${format}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Performance summary for your business</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="form-select" style={{ width: 140 }} value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={() => simulateExport('PDF')}><FiFileText size={14} /> Export PDF</button>
          <button className="btn btn-secondary" onClick={() => simulateExport('Excel')}><FiDownload size={14} /> Export Excel</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label="Revenue" value={totalRevenue} prefix="₦" icon={FiTrendingUp} tone="success" trend={9.8} delay={0} />
        <StatCard label="Expenses" value={totalExpenses} prefix="₦" icon={FiTrendingDown} tone="danger" trend={-2.1} delay={0.05} />
        <StatCard label="Net profit" value={profit} prefix="₦" icon={FiDollarSign} tone="primary" trend={6.4} delay={0.1} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }} className="repGrid">
        <ChartCard title="Sales trends" subtitle={`${period} revenue trend`} delay={0.12}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueOverview} margin={{ left: -18, top: 6 }}>
              <defs>
                <linearGradient id="repGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5} fill="url(#repGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top customers" subtitle="By total spend" delay={0.16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
            {topCustomers.map(([name, value], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < topCustomers.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 7, background: 'var(--primary-50)', color: 'var(--primary)',
                  fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Top products" subtitle="Best performing products by revenue" delay={0.2}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topProducts} margin={{ left: -18, top: 6 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
            <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
            <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <style>{`@media (max-width: 1000px) { .repGrid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
