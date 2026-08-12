import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiBox } from 'react-icons/fi';
import { useSales } from '../../contexts/SalesContext';
import { useProducts } from '../../contexts/ProductContext';
import { useCustomers } from '../../contexts/CustomerContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import StatCard from './components/StatCard';
import ChartCard from './components/ChartCard';
import { RecentSalesWidget, LowStockWidget, RecentCustomersWidget, LatestActivitiesWidget } from './components/Widgets';
import { getRevenueOverview, getMonthlySales, getTopProducts, getRevenueByPaymentMethod } from './dashboardUtils';

const PIE_COLORS = ['#2563EB', '#22C55E', '#F59E0B'];

export default function Dashboard() {
  const { sales } = useSales();
  const { products, lowStockProducts } = useProducts();
  const { customers } = useCustomers();
  const { user } = useAuth();

  const today = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter((s) => s.createdAt.slice(0, 10) === today);
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenseEstimate = totalRevenue * 0.58;
  const profit = totalRevenue - totalExpenseEstimate;
  const inventoryCount = products.reduce((sum, p) => sum + p.stock, 0);

  const revenueOverview = getRevenueOverview(sales);
  const monthlySales = getMonthlySales(sales);
  const topProducts = getTopProducts(sales);
  const paymentMethodData = getRevenueByPaymentMethod(sales);

  const sortedCustomers = [...customers].sort((a, b) => new Date(b.joined) - new Date(a.joined));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p>Here's what's happening with {user?.business} today.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label="Today's Sales" value={todayTotal} prefix="₦" icon={FiDollarSign} tone="primary" trend={8.2} delay={0} />
        <StatCard label="Revenue" value={totalRevenue} prefix="₦" icon={FiTrendingUp} tone="success" trend={12.4} delay={0.04} />
        <StatCard label="Profit" value={profit} prefix="₦" icon={FiTrendingUp} tone="info" trend={5.1} delay={0.08} />
        <StatCard label="Expenses" value={totalExpenseEstimate} prefix="₦" icon={FiTrendingDown} tone="danger" trend={-3.4} delay={0.12} />
        <StatCard label="Customers" value={customers.length} icon={FiUsers} tone="primary" trend={6.7} delay={0.16} />
        <StatCard label="Inventory Count" value={inventoryCount} icon={FiBox} tone="warning" trend={2.2} delay={0.2} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }} className="dashGrid">
        <ChartCard title="Revenue overview" subtitle="Last 14 days" delay={0.1}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueOverview} margin={{ left: -18, top: 6 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by payment method" subtitle="Share of total revenue" delay={0.14}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={58} outerRadius={88} paddingAngle={3}>
                {paymentMethodData.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: -8, flexWrap: 'wrap' }}>
            {paymentMethodData.map((entry, i) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="dashGrid">
        <ChartCard title="Monthly sales" subtitle="Last 6 months" delay={0.18}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={monthlySales} margin={{ left: -18, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Bar dataKey="sales" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top products" subtitle="By revenue generated" delay={0.22}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 10, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-soft)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={140} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12.5 }} />
              <Bar dataKey="value" fill="#22C55E" radius={[0, 6, 6, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="dashGrid2">
        <RecentSalesWidget sales={sales} delay={0.1} />
        <LowStockWidget products={lowStockProducts} delay={0.14} />
        <RecentCustomersWidget customers={sortedCustomers} delay={0.18} />
        <LatestActivitiesWidget delay={0.22} />
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .dashGrid, .dashGrid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
