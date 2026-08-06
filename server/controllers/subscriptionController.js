import crypto from 'crypto';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import Business from '../models/Business.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { isPaystackConfigured, initializeTransaction, verifyTransaction } from '../services/paystackService.js';
import { activatePaidPayment } from '../services/subscriptionService.js';

// POST /api/subscription/checkout — { plan: 'Growth' }
// Starts a real Paystack transaction for the signed-in business's Owner and
// returns the checkout URL to redirect them to. The price is always looked
// up server-side from the Plan collection — never trust a client-supplied
// amount for something that charges real money.
export const startCheckout = asyncHandler(async (req, res) => {
  if (!isPaystackConfigured()) {
    throw ApiError.badRequest('Payments are not configured yet. Set PAYSTACK_SECRET_KEY on the server to enable plan upgrades.');
  }

  const { plan: planName } = req.body;
  const plan = await Plan.findOne({ name: planName });
  if (!plan) throw ApiError.badRequest('Unknown plan');

  const business = await Business.findById(req.businessId);
  if (!business) throw ApiError.notFound('Business not found');

  const reference = `biz_${business._id}_${crypto.randomBytes(6).toString('hex')}`;
  const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}`;

  const checkout = await initializeTransaction({
    email: business.email,
    amountKobo: Math.round(plan.price * 100),
    reference,
    callbackUrl: `${env.clientUrl}/settings/billing/callback`,
    metadata: { businessId: business._id.toString(), plan: plan.name },
  });

  await Payment.create({
    business: business._id,
    invoiceNo,
    plan: plan.name,
    amount: plan.price,
    method: 'Paystack',
    status: 'Pending',
    providerReference: reference,
  });

  await AuditLog.create({
    action: `Started checkout for ${plan.name} plan (invoice ${invoiceNo})`,
    category: 'Payment Events',
    user: req.staff.name,
    business: business._id,
    ip: req.ip,
    device: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ success: true, data: { authorizationUrl: checkout.authorization_url, reference } });
});

// GET /api/subscription/verify/:reference — called from the frontend's
// post-checkout callback page. Confirms the transaction directly with
// Paystack so the UI has an answer immediately, without waiting on the
// webhook (see activatePaidPayment's doc comment for why both exist).
export const verifyCheckout = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ providerReference: req.params.reference });
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.business.toString() !== req.businessId) throw ApiError.forbidden('Not your payment');

  if (payment.status === 'Paid') {
    const business = await Business.findById(payment.business);
    return res.json({ success: true, data: { payment, business, alreadyActive: true } });
  }

  const result = await verifyTransaction(req.params.reference);

  if (result.status === 'success') {
    const { payment: updatedPayment, business } = await activatePaidPayment(payment, { source: 'checkout-verify' });
    return res.json({ success: true, data: { payment: updatedPayment, business, alreadyActive: false } });
  }

  if (result.status === 'failed') {
    payment.status = 'Failed';
    await payment.save();
  }

  res.json({ success: true, data: { payment, business: null, alreadyActive: false } });
});

export default { startCheckout, verifyCheckout };
