import { mockBusinesses } from './mockBusinesses';

const actions = [
  { action: 'Logged in', category: 'Login' },
  { action: 'Changed password', category: 'Password Changes' },
  { action: 'Created new business account', category: 'Business Creation' },
  { action: 'Upgraded subscription plan', category: 'Subscription Changes' },
  { action: 'Processed payment', category: 'Payment Events' },
  { action: 'Changed staff role to Manager', category: 'Role Changes' },
  { action: 'Updated platform settings', category: 'Settings Changes' },
  { action: 'Suspended business account', category: 'Business Creation' },
  { action: 'Downgraded subscription plan', category: 'Subscription Changes' },
  { action: 'Failed login attempt', category: 'Login' },
];

const devices = ['Chrome on Windows', 'Safari on macOS', 'Chrome on Android', 'Firefox on Ubuntu', 'Safari on iOS'];
const actors = ['Damilola Ogundipe', 'Kemi Adisa (Support)', 'David Okoro (Support)', 'System', 'Super Admin'];

export const mockAuditLogs = Array.from({ length: 35 }).map((_, i) => {
  const a = actions[i % actions.length];
  const biz = mockBusinesses[i % mockBusinesses.length];
  return {
    id: `LOG-${10000 + i}`,
    action: a.action,
    category: a.category,
    user: actors[i % actors.length],
    business: i % 3 === 0 ? biz.name : '—',
    ip: `197.210.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    device: devices[i % devices.length],
    time: new Date(Date.now() - i * 3600000 * 3.2).toISOString(),
  };
});

export const auditCategories = [...new Set(actions.map((a) => a.category))];
