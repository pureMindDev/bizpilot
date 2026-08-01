import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Completes a POS checkout: validates stock, creates the sale, decrements inventory,
 * updates customer stats, and raises the relevant notifications.
 */
export const completeCheckout = async ({ businessId, items, paymentMethod, discount = 0, customer = 'Walk-in Customer', cashierName }) => {
  const resolvedItems = [];
  let subtotal = 0;

  for (const line of items) {
    const product = await Product.findOne({ _id: line.productId, business: businessId });
    if (!product) throw ApiError.notFound(`Product ${line.productId} not found`);
    if (product.stock < line.qty) throw ApiError.badRequest(`Insufficient stock for ${product.name}`);
    resolvedItems.push({ product: product._id, name: product.name, price: product.sellingPrice, qty: line.qty });
    subtotal += product.sellingPrice * line.qty;
  }

  const tax = Math.round((subtotal - discount) * 0.075);
  const total = subtotal - discount + tax;

  const sale = await Sale.create({
    business: businessId,
    items: resolvedItems,
    subtotal,
    tax,
    discount,
    total,
    paymentMethod,
    customer,
    cashier: cashierName,
  });

  await Promise.all(resolvedItems.map((it) => Product.updateOne({ _id: it.product }, { $inc: { stock: -it.qty } })));

  if (customer && customer !== 'Walk-in Customer') {
    await Customer.updateOne({ business: businessId, name: customer }, { $inc: { totalPurchases: total, orders: 1 } });
  }

  await Notification.create({
    business: businessId,
    type: 'sale',
    title: 'New sale recorded',
    message: `A sale of ₦${total.toLocaleString()} was completed by ${cashierName}.`,
  });

  await raiseLowStockNotifications(businessId, resolvedItems.map((i) => i.product));

  return sale;
};

const raiseLowStockNotifications = async (businessId, productIds) => {
  const lowStockProducts = await Product.find({ _id: { $in: productIds }, $expr: { $lte: ['$stock', '$reorderLevel'] } });
  await Promise.all(
    lowStockProducts.map((p) =>
      Notification.create({
        business: businessId,
        type: 'stock',
        title: 'Low stock alert',
        message: `${p.name} has only ${p.stock} units left.`,
      })
    )
  );
};

export default { completeCheckout };
