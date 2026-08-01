import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Expense from '../models/Expense.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const oid = (id) => new mongoose.Types.ObjectId(id);

// GET /api/dashboard/summary — headline stats for the dashboard
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const businessId = oid(req.businessId);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todaySales, revenueAgg, expenseAgg, customerCount, inventoryAgg] = await Promise.all([
    Sale.aggregate([
      { $match: { business: businessId, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Sale.aggregate([{ $match: { business: businessId } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Expense.aggregate([{ $match: { business: businessId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Customer.countDocuments({ business: req.businessId }),
    Product.aggregate([{ $match: { business: businessId } }, { $group: { _id: null, total: { $sum: '$stock' } } }]),
  ]);

  const revenue = revenueAgg[0]?.total || 0;
  const expenses = expenseAgg[0]?.total || 0;

  res.json({
    success: true,
    data: {
      todaySales: todaySales[0]?.total || 0,
      revenue,
      expenses,
      profit: revenue - expenses,
      totalCustomers: customerCount,
      inventoryCount: inventoryAgg[0]?.total || 0,
    },
  });
});

// GET /api/dashboard/revenue-overview?days=14
export const getRevenueOverview = asyncHandler(async (req, res) => {
  const days = Math.min(90, Number(req.query.days) || 14);
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await Sale.aggregate([
    { $match: { business: oid(req.businessId), createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' } } },
    { $sort: { _id: 1 } },
  ]);

  const map = new Map(rows.map((r) => [r._id, r.revenue]));
  const series = Array.from({ length: days }).map((_, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }), revenue: map.get(key) || 0 };
  });

  res.json({ success: true, data: series });
});

// GET /api/dashboard/top-products?limit=5
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Number(req.query.limit) || 5);
  const rows = await Sale.aggregate([
    { $match: { business: oid(req.businessId) } },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', value: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
    { $sort: { value: -1 } },
    { $limit: limit },
    { $project: { _id: 0, name: '$_id', value: 1 } },
  ]);
  res.json({ success: true, data: rows });
});

// GET /api/dashboard/revenue-by-payment-method
export const getRevenueByPaymentMethod = asyncHandler(async (req, res) => {
  const rows = await Sale.aggregate([
    { $match: { business: oid(req.businessId) } },
    { $group: { _id: '$paymentMethod', value: { $sum: '$total' } } },
    { $project: { _id: 0, name: '$_id', value: 1 } },
  ]);
  res.json({ success: true, data: rows });
});

// GET /api/reports/summary?period=Monthly
export const getReportsSummary = asyncHandler(async (req, res) => {
  const businessId = oid(req.businessId);

  const [revenueAgg, expenseAgg, topCustomersAgg] = await Promise.all([
    Sale.aggregate([{ $match: { business: businessId } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Expense.aggregate([{ $match: { business: businessId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Sale.aggregate([
      { $match: { business: businessId } },
      { $group: { _id: '$customer', total: { $sum: '$total' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: '$_id', total: 1 } },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total || 0;
  const expenses = expenseAgg[0]?.total || 0;

  res.json({
    success: true,
    data: { revenue, expenses, profit: revenue - expenses, topCustomers: topCustomersAgg },
  });
});
