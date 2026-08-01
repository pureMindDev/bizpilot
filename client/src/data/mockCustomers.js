const firstNames = ['Adaeze', 'Chinedu', 'Bolanle', 'Tunde', 'Ifeoma', 'Emeka', 'Yetunde', 'Kelechi', 'Amaka', 'Segun', 'Ngozi', 'Femi', 'Blessing', 'Uche', 'Aisha', 'Musa'];
const lastNames = ['Okafor', 'Adeyemi', 'Balogun', 'Eze', 'Okonkwo', 'Ibrahim', 'Nwosu', 'Afolabi', 'Yusuf', 'Chukwu', 'Ogunleye', 'Danjuma'];
const cities = ['Lagos', 'Abuja', 'Osogbo', 'Ibadan', 'Port Harcourt', 'Kano', 'Enugu', 'Benin City'];

export const mockCustomers = Array.from({ length: 18 }).map((_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 3) % lastNames.length];
  const totalPurchases = Math.floor(Math.random() * 450000) + 20000;
  const debt = i % 4 === 0 ? Math.floor(Math.random() * 35000) : 0;
  return {
    id: `CUST-${2000 + i}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
    phone: `080${Math.floor(10000000 + Math.random() * 89999999)}`,
    city: cities[i % cities.length],
    totalPurchases,
    outstandingDebt: debt,
    orders: Math.floor(Math.random() * 40) + 1,
    notes: i % 5 === 0 ? 'Prefers transfer payments. Bulk buyer for events.' : '',
    joined: new Date(Date.now() - (i + 5) * 86400000 * 9).toISOString(),
    status: debt > 0 ? 'debt' : 'active',
  };
});
