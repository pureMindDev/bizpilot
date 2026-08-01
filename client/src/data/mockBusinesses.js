const businessNames = [
  'Ogundipe General Stores', 'Chidi Electronics Hub', 'Yetunde Fashion House', 'Kano Traders Ltd',
  'Emeka Auto Parts', 'Lagos Fresh Mart', 'Bello & Sons Hardware', 'Ibadan Beauty Supplies',
  'Port Harcourt Pharmacy', 'Abuja Tech Solutions', 'Enugu Book Depot', 'Osun Textile World',
  'Kaduna Wholesale Foods', 'Naija Gadget Store', 'Benin Furniture Mart', 'Delta Farm Produce',
  'Sokoto Provisions', 'Calabar Seafood Co', 'Jos Dairy Products', 'Ilorin Shoe Palace',
];

const owners = [
  'Damilola Ogundipe', 'Chidi Nwankwo', 'Yetunde Alabi', 'Aisha Bello', 'Emeka Obi',
  'Funmi Adeyemi', 'Tunde Bello', 'Grace Okoro', 'Musa Ibrahim', 'Ngozi Eze',
  'Kelechi Uche', 'Bola Fashola', 'Ifeanyi Chukwu', 'Halima Yusuf', 'Segun Afolabi',
  'Chiamaka Nwosu', 'Ismail Danjuma', 'Blessing Etim', 'Rasheed Balogun', 'Amaka Okafor',
];

const cities = ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Enugu', 'Osogbo', 'Kaduna', 'Benin City', 'Jos'];
const plans = ['Starter', 'Growth', 'Enterprise'];
const statuses = ['Active', 'Trial', 'Expired', 'Suspended'];

export const mockBusinesses = businessNames.map((name, i) => {
  const plan = plans[i % plans.length];
  const status = statuses[i % statuses.length];
  const users = Math.floor(Math.random() * 12) + 1;
  const products = Math.floor(Math.random() * 300) + 20;
  const sales = Math.floor(Math.random() * 5000000) + 100000;
  return {
    id: `BIZ-${4000 + i}`,
    name,
    owner: owners[i],
    email: `${owners[i].split(' ')[0].toLowerCase()}@${name.split(' ')[0].toLowerCase()}.ng`,
    phone: `080${Math.floor(10000000 + Math.random() * 89999999)}`,
    city: cities[i % cities.length],
    plan,
    status,
    users,
    products,
    totalSales: sales,
    createdAt: new Date(Date.now() - (i + 5) * 86400000 * 11).toISOString(),
    renewalDate: new Date(Date.now() + (30 - i) * 86400000).toISOString(),
    logo: null,
    activity: [
      { action: 'Made a sale of ₦' + Math.floor(Math.random() * 50000).toLocaleString(), time: new Date(Date.now() - 3600000 * (i + 1)).toISOString() },
      { action: 'Added a new product', time: new Date(Date.now() - 86400000 * (i % 5 + 1)).toISOString() },
      { action: 'Staff member logged in', time: new Date(Date.now() - 86400000 * (i % 3 + 2)).toISOString() },
    ],
  };
});

export const businessCities = cities;
export const businessPlans = plans;
export const businessStatuses = statuses;
