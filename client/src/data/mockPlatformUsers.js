import { mockBusinesses } from './mockBusinesses';

const firstNames = ['Tobi', 'Chiamaka', 'Suleiman', 'Faith', 'Obinna', 'Zainab', 'Wale', 'Precious', 'Ahmed', 'Ruth', 'Chukwuemeka', 'Fatima', 'Gbenga', 'Esther', 'Yakubu'];
const lastNames = ['Adewale', 'Nnamdi', 'Garba', 'Okon', 'Chukwuma', 'Lawal', 'Adisa', 'Umoh', 'Sani', 'Ekwueme'];
const roles = ['Owner', 'Manager', 'Cashier', 'Sales Rep', 'Inventory Officer'];
const statuses = ['active', 'suspended'];

export const mockPlatformUsers = Array.from({ length: 26 }).map((_, i) => {
  const biz = mockBusinesses[i % mockBusinesses.length];
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 2) % lastNames.length];
  return {
    id: `USR-${8000 + i}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${biz.name.split(' ')[0].toLowerCase()}.ng`,
    phone: `070${Math.floor(10000000 + Math.random() * 89999999)}`,
    business: biz.name,
    businessId: biz.id,
    role: roles[i % roles.length],
    status: i % 9 === 0 ? 'suspended' : 'active',
    createdAt: new Date(Date.now() - (i + 3) * 86400000 * 8).toISOString(),
  };
});
