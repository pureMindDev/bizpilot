export const expenseCategories = ['Rent', 'Salary', 'Fuel', 'Electricity', 'Internet', 'Maintenance', 'Other'];

const items = [
  ['Rent', 'Shop rent - July', 250000],
  ['Salary', 'Staff salaries - July', 320000],
  ['Fuel', 'Generator fuel', 18000],
  ['Electricity', 'PHCN bill', 24500],
  ['Internet', 'MTN business data', 15000],
  ['Maintenance', 'AC servicing', 12000],
  ['Fuel', 'Delivery bike fuel', 9000],
  ['Salary', 'Casual staff wages', 40000],
  ['Other', 'Office supplies', 7500],
  ['Maintenance', 'POS terminal repair', 5000],
  ['Electricity', 'Backup generator repair', 32000],
  ['Rent', 'Warehouse rent', 180000],
];

export const mockExpenses = items.map((it, i) => ({
  id: `EXP-${6000 + i}`,
  category: it[0],
  description: it[1],
  amount: it[2],
  date: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  recordedBy: ['Damilola Ogundipe', 'Ifeanyi Okoro'][i % 2],
}));
