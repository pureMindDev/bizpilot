import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate, buildMeta } from '../utils/paginate.js';
import { isPaystackConfigured, requestPaystackRefund } from '../services/paystackService.js';

export const listPayments = asyncHandler(async (req, res) => {
  const { search = '', status = 'All', method = 'All' } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (status !== 'All') filter.status = status;
  if (method !== 'All') filter.method = method;

  const payments = await Payment.find(filter).populate('business', 'name').sort({ date: -1 }).skip(skip).limit(limit);
  const total = await Payment.countDocuments(filter);

  let data = payments.map((p) => ({ ...p.toObject(), businessId: p.business?._id, business: p.business?.name || 'Unknown' }));
  if (search) {
    const q = search.toLowerCase();
    data = data.filter((p) => p.business.toLowerCase().includes(q) || p.invoiceNo.toLowerCase().includes(q));
  }

  const revenueAgg = await Payment.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
  const pendingCount = await Payment.countDocuments({ status: 'Pending' });

  res.json({
    success: true,
    data,
    meta: buildMeta({ total, page, limit }),
    summary: { totalRevenue: revenueAgg[0]?.total || 0, pendingCount },
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'Paid') throw ApiError.badRequest('Only paid invoices can be refunded');

  // If this payment came through a real Paystack charge and PAYSTACK_SECRET_KEY
  // is configured, actually call Paystack's refund API. Paystack processes
  // refunds asynchronously and confirms via the `refund.processed` webhook
  // (see paymentWebhookController.js) — status is set to 'Refunded' here
  // optimistically for immediate UI feedback, and the webhook is the source
  // of truth if it later disagrees.
  // Falls back to a DB-only simulated refund (no reference, or no API key
  // configured) — the same "log instead of throw" pattern used by
  // emailService.js and saleService.js for local dev without live credentials.
  if (payment.providerReference && isPaystackConfigured()) {
    await requestPaystackRefund(payment.providerReference, Math.round(payment.amount * 100));
  }

  payment.status = 'Refunded';
  await payment.save();

  await AuditLog.create({
    action: `Refunded payment ${payment.invoiceNo}`,
    category: 'Payment Events',
    user: req.admin.name,
    business: payment.business,
    ip: req.ip,
    device: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ success: true, data: payment });
});

export const getRevenueGrowth = asyncHandler(async (req, res) => {
  const rows = await Payment.aggregate([
    { $match: { status: 'Paid' } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, revenue: { $sum: '$amount' } } },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);
  res.json({ success: true, data: rows.map((r) => ({ month: r._id, revenue: r.revenue })) });
});
