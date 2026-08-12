import Business from '../models/Business.js';
import AuditLog from '../models/AuditLog.js';

const THIRTY_DAYS_MS = 30 * 86400000;

/**
 * Marks a Payment as Paid and activates the plan it was for on the owning
 * Business. Idempotent — safe to call from both the post-checkout verify
 * endpoint (subscriptionController.js) and the Paystack webhook
 * (paymentWebhookController.js), since a single successful transaction can
 * legitimately trigger both paths (user redirected back *and* webhook fires).
 * Whichever runs first wins; the second call is a no-op.
 */
export const activatePaidPayment = async (payment, { source = 'system' } = {}) => {
  if (payment.status === 'Paid') return { payment, business: null, alreadyActive: true };

  payment.status = 'Paid';
  await payment.save();

  const business = await Business.findById(payment.business);
  if (business) {
    business.plan = payment.plan;
    business.status = 'Active';
    business.renewalDate = new Date(Date.now() + THIRTY_DAYS_MS);
    await business.save();

    await AuditLog.create({
      action: `Subscribed to ${payment.plan} plan (invoice ${payment.invoiceNo}, via ${source})`,
      category: 'Subscription Changes',
      user: business.owner,
      business: business._id,
      ip: '',
      device: source,
    });
  }

  return { payment, business, alreadyActive: false };
};

export default { activatePaidPayment };
