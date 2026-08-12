import { AuthProvider } from './AuthContext';
import { ProductProvider } from './ProductContext';
import { SalesProvider } from './SalesContext';
import { CustomerProvider } from './CustomerContext';
import { StaffProvider } from './StaffContext';
import { NotificationProvider } from './NotificationContext';
import { SettingsProvider } from './SettingsContext';

const PROVIDERS = [AuthProvider, NotificationProvider, ProductProvider, CustomerProvider, SalesProvider, StaffProvider, SettingsProvider];

export default function BusinessProviders({ children }) {
  return PROVIDERS.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children);
}
