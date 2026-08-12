import { mockBusinesses } from './mockBusinesses';
import { mockPlans } from './mockPlans';

const methods = ['Paystack', 'Flutterwave', 'Stripe', 'Bank Transfer'];
const statuses = ['Paid', 'Pending', 'Failed', 'Refunded'];

export const mockPayments = Array.from({ length: 30 }).map((_, i) => {
  const biz = mockBusinesses[i % mockBusinesses.length];
  const plan = mockPlans[i % mockPlans.length];
  return {
    id: `PAY-${7000 + i}`,
    invoiceNo: `INV-${2026}${(1000 + i).toString().slice(1)}`,
    business: biz.name,
    businessId: biz.id,
    plan: plan.name,
    amount: plan.price,
    method: methods[i % methods.length],
    status: statuses[i % 7 === 0 ? 2 : i % 5 === 0 ? 1 : i % 11 === 0 ? 3 : 0],
    date: new Date(Date.now() - i * 86400000 * 2.3).toISOString(),
  };
});

export const paymentMethods = methods;
export const paymentStatuses = statuses;
