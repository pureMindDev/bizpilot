export const roles = ['Owner', 'Manager', 'Cashier', 'Sales Rep', 'Inventory Officer'];

export const rolePermissions = {
  Owner: ['Full access', 'Manage staff', 'View financials', 'Manage settings'],
  Manager: ['Manage inventory', 'Manage sales', 'View reports', 'Manage customers'],
  Cashier: ['Process sales', 'View products', 'Issue receipts'],
  'Sales Rep': ['Process sales', 'View customers', 'View products'],
  'Inventory Officer': ['Manage inventory', 'View suppliers', 'Stock adjustments'],
};

const staffNames = [
  ['Damilola Ogundipe', 'Owner'],
  ['Ifeanyi Okoro', 'Manager'],
  ['Precious Etim', 'Cashier'],
  ['Rasheed Bello', 'Sales Rep'],
  ['Grace Adebayo', 'Inventory Officer'],
  ['Kunle Fashola', 'Cashier'],
  ['Chiamaka Obi', 'Sales Rep'],
];

export const mockStaff = staffNames.map((s, i) => ({
  id: `STF-${3000 + i}`,
  name: s[0],
  role: s[1],
  email: `${s[0].split(' ')[0].toLowerCase()}@bizpilot.ng`,
  phone: `081${Math.floor(10000000 + Math.random() * 89999999)}`,
  status: i === 5 ? 'suspended' : 'active',
  joined: new Date(Date.now() - (i + 10) * 86400000 * 20).toISOString(),
  lastActive: new Date(Date.now() - i * 3600000 * 5).toISOString(),
  activity: [
    { action: 'Logged in', time: new Date(Date.now() - 3600000 * 2).toISOString() },
    { action: 'Recorded a sale of ₦12,500', time: new Date(Date.now() - 3600000 * 5).toISOString() },
    { action: 'Updated stock for Golden Morn 900g', time: new Date(Date.now() - 86400000).toISOString() },
  ],
}));
