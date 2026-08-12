import { AdminAuthProvider } from './AdminAuthContext';
import { BusinessProvider } from './BusinessContext';
import { PaymentProvider } from './PaymentContext';
import { PlatformUserProvider } from './PlatformUserContext';
import { SupportProvider } from './SupportContext';
import { AuditLogProvider } from './AuditLogContext';
import { PlatformNotificationProvider } from './PlatformNotificationContext';
import { AdminRoleProvider } from './AdminRoleContext';
import { PlatformSettingsProvider } from './PlatformSettingsContext';

const PROVIDERS = [
  AdminAuthProvider, PlatformSettingsProvider, BusinessProvider, PaymentProvider,
  PlatformUserProvider, SupportProvider, AuditLogProvider, PlatformNotificationProvider, AdminRoleProvider,
];

export default function AdminProviders({ children }) {
  return PROVIDERS.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children);
}
