import { mockProducts } from './mockProducts';
import { mockCustomers } from './mockCustomers';

const paymentMethods = ['Cash', 'Transfer', 'POS'];

export const mockSales = Array.from({ length: 40 }).map((_, i) => {
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items = Array.from({ length: itemCount }).map(() => {
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const qty = Math.floor(Math.random() * 4) + 1;
    return { productId: product.id, name: product.name, price: product.sellingPrice, qty };
  });
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const tax = Math.round(subtotal * 0.075);
  const discount = i % 6 === 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + tax - discount;
  const customer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
  return {
    id: `SALE-${5000 + i}`,
    items,
    subtotal,
    tax,
    discount,
    total,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    customer: i % 3 === 0 ? customer.name : 'Walk-in Customer',
    cashier: ['Precious Etim', 'Kunle Fashola', 'Rasheed Bello'][i % 3],
    createdAt: new Date(Date.now() - i * 3600000 * 3.7).toISOString(),
  };
});

export { paymentMethods };
