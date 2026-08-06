import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminProtectedRoute from './AdminProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';
import AdminLogin from '../pages/admin/AdminLogin';
import Landing from '../pages/marketing/Landing';

import Dashboard from '../features/dashboard/Dashboard';
import Inventory from '../features/inventory/Inventory';
import Sales from '../features/sales/Sales';
import Customers from '../features/customers/Customers';
import Staff from '../features/staff/Staff';
import Reports from '../features/reports/Reports';
import Expenses from '../features/expenses/Expenses';
import Settings from '../features/settings/Settings';
import Notifications from '../features/notifications/Notifications';
import BillingCallback from '../pages/billing/BillingCallback';

import AdminDashboard from '../features/admin/dashboard/AdminDashboard';
import Businesses from '../features/admin/businesses/Businesses';
import BusinessDetails from '../features/admin/businesses/BusinessDetails';
import Subscriptions from '../features/admin/subscriptions/Subscriptions';
import Payments from '../features/admin/payments/Payments';
import PlatformUsers from '../features/admin/users/PlatformUsers';
import Support from '../features/admin/support/Support';
import PlatformNotifications from '../features/admin/notifications/PlatformNotifications';
import AuditLogs from '../features/admin/auditlogs/AuditLogs';
import Analytics from '../features/admin/analytics/Analytics';
import RolesPermissions from '../features/admin/roles/RolesPermissions';
import PlatformSettings from '../features/admin/settings/PlatformSettings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Business auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Business dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/billing/callback" element={<BillingCallback />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Super Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Super Admin console */}
      <Route
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/businesses" element={<Businesses />} />
        <Route path="/admin/businesses/:id" element={<BusinessDetails />} />
        <Route path="/admin/subscriptions" element={<Subscriptions />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/users" element={<PlatformUsers />} />
        <Route path="/admin/support" element={<Support />} />
        <Route path="/admin/notifications" element={<PlatformNotifications />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/roles" element={<RolesPermissions />} />
        <Route path="/admin/settings" element={<PlatformSettings />} />
      </Route>

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
