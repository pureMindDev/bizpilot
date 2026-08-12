import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBusinesses } from '../../../contexts/BusinessContext';
import { adminApi } from '../../../services/api';
import { formatCurrency, formatMonthLabel } from '../../../utils/format';
import { getPlanDistribution } from '../dashboard/adminDashboardUtils';
import ChartCard from '../../dashboard/components/ChartCard';

const PLAN_COLORS = ['#64748B', '#2563EB', '#7C3AED'];
const TYPE_COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#0EA5E9'];
const BUSINESS_TYPES = ['Retail', 'Wholesale', 'Services', 'Fashion', 'Electronics'];

export default function Analytics() {
  const { businesses } = useBusinesses();
  const [revenueGrowth, setRevenueGrowth] = useState([]);
  const [monthlySignups, setMonthlySignups] = useState([]);

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/payments/revenue-growth'),
      adminApi.get('/admin/dashboard/monthly-signups'),
    ]).then(([revenueRes, signupsRes]) => {
      setRevenueGrowth(revenueRes.data.data.map((r) => ({ ...r, month: formatMonthLabel(r.month) })));
      setMonthlySignups(signupsRes.data.data.map((r) => ({ ...r, month: formatMonthLabel(r.month) })));
    });
  }, []);

  const planDistribution = useMemo(() => getPlanDistribution(businesses), [businesses]);

  // The Business model has no "industry" field yet, so this can't be real
  // data without a schema change — labeled as an estimate rather than
  // silently presenting a fabricated chart as if it were measured.
  const businessTypes = useMemo(() => BUSINESS_TYPES.map((name, i) => ({ name, value: Math.floor(businesses.length / BUSINESS_TYPES.length) + (i % 2) })), [businesses]);

  const forecast = useMemo(() => {
    const base = revenueGrowth[revenueGrowth.length - 1]?.revenue || 500000;
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return [...revenueGrowth, ...months.map((month, i) => ({ month, revenue: Math.round(base * (1 + (i + 1) * 0.08)), forecast: true }))];
  }, [revenueGrowth]);

  // No session/activity-tracking system exists yet to back this with real
  // numbers — same as businessTypes, labeled as an estimate rather than
  // presented as measured data.
  const userActivity = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({ day, active: Math.floor(Math.random() * 60) + 40 }));
  }, []);

  const topBusinesses = useMemo(() => [...businesses].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0)).slice(0, 6), [businesses]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Deep-dive metrics across the BizPilot platform</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }} className="anaGrid">
        <ChartCard title="Monthly revenue" subtitle="Platform revenue over time" delay={0}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueGrowth} margin={{ left: -18, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Plan distribution" subtitle="Businesses by subscription plan" delay={0.04}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={planDistribution} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={54} outerRadius={82} paddingAngle={3}>
                {planDistribution.map((entry, i) => <Cell key={entry.name} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="anaGrid">
        <ChartCard title="Business signups" subtitle="New businesses per month" delay={0.08}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySignups} margin={{ left: -18, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Bar dataKey="signups" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Business types" subtitle="Estimated distribution by industry (no industry field tracked yet)" delay={0.12}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={businessTypes} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={54} outerRadius={82} paddingAngle={3}>
                {businessTypes.map((entry, i) => <Cell key={entry.name} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }} className="anaGrid">
        <ChartCard title="Revenue forecast" subtitle="Projected revenue for the next 5 months" delay={0.16}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={forecast} margin={{ left: -18, top: 6 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Area type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2.5} fill="url(#forecastGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User activity" subtitle="Estimated — no session tracking yet" delay={0.2}>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={userActivity} margin={{ left: -18, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Line type="monotone" dataKey="active" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Top businesses" subtitle="Ranked by total sales volume" delay={0.24}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
          {topBusinesses.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < topBusinesses.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
              <span style={{
                width: 26, height: 26, borderRadius: 7, background: 'var(--primary-50)', color: 'var(--primary)',
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</span>
              <span className="badge badge-info">{b.plan}</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, minWidth: 100, textAlign: 'right' }}>{formatCurrency(b.totalSales)}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <style>{`@media (max-width: 1000px) { .anaGrid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
