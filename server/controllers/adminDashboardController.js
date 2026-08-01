import Business from '../models/Business.js';
import Staff from '../models/Staff.js';
import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/admin/dashboard/summary
export const getAdminDashboardSummary = asyncHandler(async (req, res) => {
  const [total, active, trial, expired, totalUsers, revenueAgg, pendingCount, plans] = await Promise.all([
    Business.countDocuments(),
    Business.countDocuments({ status: 'Active' }),
    Business.countDocuments({ status: 'Trial' }),
    Business.countDocuments({ status: 'Expired' }),
    Staff.countDocuments(),
    Payment.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.countDocuments({ status: 'Pending' }),
    Plan.find(),
  ]);

  const revenue = revenueAgg[0]?.total || 0;
  const mrr = plans.reduce((sum, p) => sum + p.price, 0);
  const activeSubscriptions = active + trial;

  res.json({
    success: true,
    data: {
      totalBusinesses: total,
      activeBusinesses: active,
      trialBusinesses: trial,
      expiredBusinesses: expired,
      totalUsers,
      monthlyRevenue: revenue,
      annualRevenue: revenue * 11.4,
      mrr,
      activeSubscriptions,
      pendingPayments: pendingCount,
    },
  });
});

// GET /api/admin/dashboard/business-growth
export const getBusinessGrowth = asyncHandler(async (req, res) => {
  const rows = await Business.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  let running = 0;
  const cumulative = rows.map((r) => {
    running += r.count;
    return { month: r._id, businesses: running };
  });

  res.json({ success: true, data: cumulative.slice(-6) });
});

// GET /api/admin/dashboard/plan-distribution
export const getPlanDistribution = asyncHandler(async (req, res) => {
  const rows = await Business.aggregate([
    { $group: { _id: '$plan', value: { $sum: 1 } } },
    { $project: { _id: 0, name: '$_id', value: 1 } },
  ]);
  res.json({ success: true, data: rows });
});

// GET /api/admin/dashboard/monthly-signups
export const getMonthlySignups = asyncHandler(async (req, res) => {
  const rows = await Business.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, signups: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);
  res.json({ success: true, data: rows.map((r) => ({ month: r._id, signups: r.signups })) });
});

// GET /api/admin/dashboard/top-businesses
export const getTopBusinesses = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Number(req.query.limit) || 6);
  const businesses = await Business.find().sort({ createdAt: -1 }).limit(200);
  // totalSales isn't stored on Business directly; this endpoint favors recency here,
  // dedicated per-business totals are available via /api/admin/businesses (enriched list).
  res.json({ success: true, data: businesses.slice(0, limit) });
});
