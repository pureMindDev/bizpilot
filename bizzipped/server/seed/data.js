export const productCatalog = [
  ['Coca-Cola 50cl (Pack of 24)', 'Beverages', 7200, 8500],
  ['Golden Morn 900g', 'Groceries', 1850, 2300],
  ['Peak Milk Powder 400g', 'Groceries', 2200, 2750],
  ['Indomie Noodles (Carton)', 'Groceries', 5600, 6800],
  ['Dettol Antiseptic 500ml', 'Household', 1400, 1900],
  ['Samsung Galaxy A15 Charger', 'Electronics', 3200, 4500],
  ['Oraimo Power Bank 10000mAh', 'Electronics', 8500, 12000],
  ['Zaron Matte Lipstick', 'Cosmetics', 1200, 2000],
  ['Nivea Body Lotion 400ml', 'Cosmetics', 1900, 2600],
  ['Ankara Fabric (6 Yards)', 'Fashion', 4500, 7000],
  ["Men's Polo Shirt (L)", 'Fashion', 3000, 5500],
  ['HP A4 Paper Ream', 'Stationery', 2500, 3200],
  ['Bic Ballpoint Pens (Box)', 'Stationery', 900, 1500],
  ['Rubbermaid Storage Box', 'Household', 3500, 5000],
  ['LED Bulb 12W (Pack of 4)', 'Electronics', 2100, 3400],
  ['Milo Refill 400g', 'Groceries', 1650, 2100],
  ['Always Ultra Pads', 'Cosmetics', 950, 1450],
  ['Kings Vegetable Oil 5L', 'Groceries', 8200, 9800],
  ['Ariel Detergent 900g', 'Household', 1750, 2350],
  ['Infinix Smart 8 Case', 'Electronics', 800, 1600],
  ['Wall Clock (Analog)', 'Household', 2800, 4200],
  ["Children's Exercise Books (Pack)", 'Stationery', 1300, 2000],
  ['Ladies Handbag', 'Fashion', 6500, 11000],
  ['Bluetooth Earpiece', 'Electronics', 4200, 6800],
  ['Sunlight Dishwashing Liquid', 'Household', 1100, 1600],
];

export const suppliers = ['Lagos Wholesale Hub', 'Coscharis Distributors', 'Naija Fresh Foods', 'TechPoint Supplies', 'Beauty World NG', 'Kaduna Textiles Ltd'];

export const customerFirstNames = ['Adaeze', 'Chinedu', 'Bolanle', 'Tunde', 'Ifeoma', 'Emeka', 'Yetunde', 'Kelechi', 'Amaka', 'Segun', 'Ngozi', 'Femi', 'Blessing', 'Uche', 'Aisha', 'Musa'];
export const customerLastNames = ['Okafor', 'Adeyemi', 'Balogun', 'Eze', 'Okonkwo', 'Ibrahim', 'Nwosu', 'Afolabi', 'Yusuf', 'Chukwu', 'Ogunleye', 'Danjuma'];
export const cities = ['Lagos', 'Abuja', 'Osogbo', 'Ibadan', 'Port Harcourt', 'Kano', 'Enugu', 'Benin City'];

export const staffRoster = [
  ['Ifeanyi Okoro', 'Manager'],
  ['Precious Etim', 'Cashier'],
  ['Rasheed Bello', 'Sales Rep'],
  ['Grace Adebayo', 'Inventory Officer'],
  ['Kunle Fashola', 'Cashier'],
];

export const expenseCatalog = [
  ['Rent', 'Shop rent - monthly', 250000],
  ['Salary', 'Staff salaries', 320000],
  ['Fuel', 'Generator fuel', 18000],
  ['Electricity', 'PHCN bill', 24500],
  ['Internet', 'MTN business data', 15000],
  ['Maintenance', 'AC servicing', 12000],
  ['Fuel', 'Delivery bike fuel', 9000],
  ['Other', 'Office supplies', 7500],
];

export const businessNames = [
  'Ogundipe General Stores', 'Chidi Electronics Hub', 'Yetunde Fashion House', 'Kano Traders Ltd',
  'Emeka Auto Parts', 'Lagos Fresh Mart', 'Bello & Sons Hardware', 'Ibadan Beauty Supplies',
  'Port Harcourt Pharmacy', 'Abuja Tech Solutions', 'Enugu Book Depot', 'Osun Textile World',
  'Kaduna Wholesale Foods', 'Naija Gadget Store', 'Benin Furniture Mart', 'Delta Farm Produce',
  'Sokoto Provisions', 'Calabar Seafood Co', 'Jos Dairy Products', 'Ilorin Shoe Palace',
];

export const businessOwners = [
  'Damilola Ogundipe', 'Chidi Nwankwo', 'Yetunde Alabi', 'Aisha Bello', 'Emeka Obi',
  'Funmi Adeyemi', 'Tunde Bello', 'Grace Okoro', 'Musa Ibrahim', 'Ngozi Eze',
  'Kelechi Uche', 'Bola Fashola', 'Ifeanyi Chukwu', 'Halima Yusuf', 'Segun Afolabi',
  'Chiamaka Nwosu', 'Ismail Danjuma', 'Blessing Etim', 'Rasheed Balogun', 'Amaka Okafor',
];

export const supportSubjects = [
  'Unable to print receipt', 'Payment not reflecting after upgrade', 'Cannot add new staff member',
  'Inventory count showing wrong figures', 'Login issues after password reset', 'Need help exporting reports',
  'Barcode scanner not connecting', 'Requesting refund for duplicate charge', 'Dashboard charts not loading',
  'How do I add a second branch?', 'Customer debt not updating', 'App running slow on mobile',
];

export const platformNotifications = [
  { type: 'security', title: 'Multiple failed login attempts', message: 'Detected 5 failed login attempts for Kano Traders Ltd.' },
  { type: 'payment', title: 'Payment failed', message: 'Subscription renewal failed for Benin Furniture Mart.' },
  { type: 'business', title: 'New business signed up', message: 'Ilorin Shoe Palace just created an account on the Growth plan.' },
  { type: 'system', title: 'Scheduled maintenance', message: 'Platform maintenance is scheduled for Sunday, 2AM WAT.' },
  { type: 'business', title: 'Business suspended', message: 'Sokoto Provisions was auto-suspended due to expired subscription.' },
  { type: 'payment', title: 'Large payment received', message: 'Abuja Tech Solutions upgraded to Enterprise — ₦45,000 received.' },
];

export const auditActionCatalog = [
  { action: 'Logged in', category: 'Login' },
  { action: 'Changed password', category: 'Password Changes' },
  { action: 'Created new business account', category: 'Business Creation' },
  { action: 'Upgraded subscription plan', category: 'Subscription Changes' },
  { action: 'Processed payment', category: 'Payment Events' },
  { action: 'Changed staff role to Manager', category: 'Role Changes' },
  { action: 'Updated platform settings', category: 'Settings Changes' },
];
