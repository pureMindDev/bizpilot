import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';

// Error codes/names Mongo/Mongoose throw when transactions aren't available —
// i.e. running against a standalone mongod rather than a replica set/mongos.
// Local dev commonly uses a standalone instance, so this fallback lets checkout
// keep working there while still getting real atomicity in production (replica
// set / MongoDB Atlas), where session.withTransaction succeeds normally.
const isTransactionsUnsupportedError = (err) =>
  err?.code === 20 || // IllegalOperation
  err?.codeName === 'IllegalOperation' ||
  /Transaction numbers are only allowed/i.test(err?.message || '') ||
  /Transactions are not supported/i.test(err?.message || '');

/**
 * Runs `work(session)` inside a Mongo transaction when the deployment supports
 * one, falling back to running it without a session (best-effort, non-atomic)
 * against a standalone mongod. `work` must accept a possibly-null session and
 * pass it through to every Mongoose call it makes.
 */
const withOptionalTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    try {
      await session.withTransaction(async () => {
        result = await work(session);
      });
      return result;
    } catch (err) {
      if (!isTransactionsUnsupportedError(err)) throw err;
      console.warn('[saleService] MongoDB transactions unavailable (standalone mongod) — running checkout without a session. Use a replica set in production for full atomicity.');
      return work(null);
    }
  } finally {
    await session.endSession();
  }
};

/**
 * Completes a POS checkout: validates stock, creates the sale, decrements inventory,
 * and updates customer stats atomically (see withOptionalTransaction above), then
 * raises the relevant notifications outside the transaction since they're a
 * non-critical side effect rather than something that must stay consistent with
 * the sale itself.
 */
export const completeCheckout = async ({ businessId, items, paymentMethod, discount = 0, customer = 'Walk-in Customer', cashierName }) => {
  const { sale, resolvedItems } = await withOptionalTransaction(async (session) => {
    const opts = session ? { session } : {};
    const resolved = [];
    let subtotal = 0;

    for (const line of items) {
      const product = await Product.findOne({ _id: line.productId, business: businessId }, null, opts);
      if (!product) throw ApiError.notFound(`Product ${line.productId} not found`);
      if (product.stock < line.qty) throw ApiError.badRequest(`Insufficient stock for ${product.name}`);
      resolved.push({ product: product._id, name: product.name, price: product.sellingPrice, qty: line.qty });
      subtotal += product.sellingPrice * line.qty;
    }

    const tax = Math.round((subtotal - discount) * 0.075);
    const total = subtotal - discount + tax;

    const [createdSale] = await Sale.create(
      [{ business: businessId, items: resolved, subtotal, tax, discount, total, paymentMethod, customer, cashier: cashierName }],
      opts
    );

    await Promise.all(resolved.map((it) => Product.updateOne({ _id: it.product }, { $inc: { stock: -it.qty } }, opts)));

    if (customer && customer !== 'Walk-in Customer') {
      await Customer.updateOne({ business: businessId, name: customer }, { $inc: { totalPurchases: total, orders: 1 } }, opts);
    }

    return { sale: createdSale, resolvedItems: resolved };
  });

  await Notification.create({
    business: businessId,
    type: 'sale',
    title: 'New sale recorded',
    message: `A sale of ₦${sale.total.toLocaleString()} was completed by ${cashierName}.`,
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
