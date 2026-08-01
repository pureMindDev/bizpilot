const categories = ['Beverages', 'Groceries', 'Electronics', 'Cosmetics', 'Household', 'Fashion', 'Stationery'];
const suppliers = ['Lagos Wholesale Hub', 'Coscharis Distributors', 'Naija Fresh Foods', 'TechPoint Supplies', 'Beauty World NG', 'Kaduna Textiles Ltd'];

const names = [
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
  ['Men\'s Polo Shirt (L)', 'Fashion', 3000, 5500],
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
  ['Children\'s Exercise Books (Pack)', 'Stationery', 1300, 2000],
  ['Ladies Handbag', 'Fashion', 6500, 11000],
  ['Bluetooth Earpiece', 'Electronics', 4200, 6800],
  ['Sunlight Dishwashing Liquid', 'Household', 1100, 1600],
];

export const mockProducts = names.map((n, i) => {
  const stock = Math.floor(Math.random() * 120) + (i % 7 === 0 ? 0 : 5);
  const reorderLevel = 15;
  return {
    id: `PRD-${1000 + i}`,
    name: n[0],
    category: n[1],
    costPrice: n[2],
    sellingPrice: n[3],
    stock: i % 9 === 0 ? Math.floor(Math.random() * 8) : stock,
    reorderLevel,
    supplier: suppliers[i % suppliers.length],
    barcode: `615${(1000000 + i * 37).toString().slice(0, 9)}`,
    image: null,
    sku: `SKU-${(i + 1).toString().padStart(4, '0')}`,
    createdAt: new Date(Date.now() - (i + 3) * 86400000 * 3).toISOString(),
  };
});

export const productCategories = categories;
export const productSuppliers = suppliers;
