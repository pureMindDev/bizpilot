import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiBriefcase, FiCheckCircle, FiClock, FiXCircle, FiUsers, FiDollarSign, FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import { useBusinesses } from '../../../contexts/BusinessContext';
import { usePayments } from '../../../contexts/PaymentContext';
import { useSupport } from '../../../contexts/SupportContext';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { adminApi } from '../../../services/api';
import { formatCurrency, formatMonthLabel } from '../../../utils/format';
import StatCard from '../../dashboard/components/StatCard';
import ChartCard from '../../dashboard/components/ChartCard';
import { LatestBusinessesWidget, RecentPaymentsWidget, RecentTicketsWidget, PlatformActivityWidget } from './components/AdminWidgets';
import { getPlanDistribution } from './adminDashboardUtils';

const PLAN_COLORS = ['#64748B', '#2563EB', '#7C3AED'];

export default function AdminDashboard() {
  const { businesses, stats } = useBusinesses();
  const { payments, totalRevenue, pendingCount, mrr } = usePayments();
  const { tickets } = useSupport();
  const { admin } = useAdminAuth();

  const [businessGrowth, setBusinessGrowth] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState([]);
  const [monthlySignups, setMonthlySignups] = useState([]);

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/dashboard/business-growth'),
      adminApi.get('/admin/payments/revenue-growth'),
      adminApi.get('/admin/dashboard/monthly-signups'),
    ]).then(([growthRes, revenueRes, signupsRes]) => {
      setBusinessGrowth(growthRes.data.data.map((r) => ({ ...r, month: formatMonthLabel(r.month) })));
      setRevenueGrowth(revenueRes.data.data.map((r) => ({ ...r, month: formatMonthLabel(r.month) })));
      setMonthlySignups(signupsRes.data.data.map((r) => ({ ...r, month: formatMonthLabel(r.month) })));
    });
  }, []);

  const planDistribution = getPlanDistribution(businesses);
  const activeSubscriptions = businesses.filter((b) => b.status === 'Active' || b.status === 'Trial').length;

  const sortedBusinesses = [...businesses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Platform overview</h1>
          <p>Welcome back, {admin?.name.split(' ')[0]} — here's how BizPilot is performing.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Businesses" value={stats.total} icon={FiBriefcase} tone="primary" trend={7.4} delay={0} />
        <StatCard label="Active Businesses" value={stats.active} icon={FiCheckCircle} tone="success" trend={5.1} delay={0.03} />
        <StatCard label="Trial Businesses" value={stats.trial} icon={FiClock} tone="warning" trend={2.8} delay={0.06} />
        <StatCard label="Expired Businesses" value={stats.expired} icon={FiXCircle} tone="danger" trend={-1.2} delay={0.09} />
        <StatCard label="Total Users" value={stats.totalUsers} icon={FiUsers} tone="info" trend={9.6} delay={0.12} />
        <StatCard label="Monthly Revenue" value={totalRevenue} prefix="₦" icon={FiDollarSign} tone="success" trend={11.3} delay={0.15} />
        <StatCard label="Annual Revenue" value={totalRevenue * 11.4} prefix="₦" icon={FiTrendingUp} tone="primary" trend={14.2} delay={0.18} />
        <StatCard label="MRR" value={mrr} prefix="₦" icon={FiTrendingUp} tone="info" trend={6.9} delay={0.21} />
        <StatCard label="Active Subscriptions" value={activeSubscriptions} icon={FiCreditCard} tone="success" trend={4.3} delay={0.24} />
        <StatCard label="Pending Payments" value={pendingCount} icon={FiClock} tone="warning" trend={-3.1} delay={0.27} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }} className="adminGrid">
        <ChartCard title="Business growth" subtitle="Total businesses over the last 6 months" delay={0.1}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={businessGrowth} margin={{ left: -18, top: 6 }}>
              <defs>
                <linearGradient id="bizGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Area type="monotone" dataKey="businesses" stroke="#7C3AED" strokeWidth={2.5} fill="url(#bizGrowthGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Subscription plans" subtitle="Distribution across businesses" delay={0.14}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={planDistribution} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={56} outerRadius={86} paddingAngle={3}>
                {planDistribution.map((entry, i) => <Cell key={entry.name} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: -8, flexWrap: 'wrap' }}>
            {planDistribution.map((entry, i) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: PLAN_COLORS[i % PLAN_COLORS.length] }} /> {entry.name}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="adminGrid">
        <ChartCard title="Revenue growth" subtitle="Last 6 months" delay={0.18}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={revenueGrowth} margin={{ left: -18, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly signups" subtitle="New businesses per month" delay={0.22}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={monthlySignups} margin={{ left: -18, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Bar dataKey="signups" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="adminGrid2">
        <LatestBusinessesWidget businesses={sortedBusinesses} delay={0.1} />
        <RecentPaymentsWidget payments={payments} delay={0.14} />
        <RecentTicketsWidget tickets={tickets} delay={0.18} />
        <PlatformActivityWidget delay={0.22} />
      </div>

      <style>{`@media (max-width: 1000px) { .adminGrid, .adminGrid2 { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
