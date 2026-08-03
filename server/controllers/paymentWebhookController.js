import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyWebhookSignature } from '../services/paystackService.js';

/**
 * POST /api/webhooks/paystack — receives real payment/refund events from Paystack.
 *
 * Always responds 200 once the signature check passes, even if we don't
 * recognize the event type — Paystack retries on non-2xx responses, and we
 * don't want an unrelated/future event type to trigger a retry storm.
 *
 * Unsigned or badly-signed requests get 401'd so nothing forged can flip a
 * Payment to "Paid"/"Refunded".
 */
export const handlePaystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];

  if (!verifyWebhookSignature(req.rawBody, signature)) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
  }

  const { event, data } = req.body || {};
  const reference = data?.reference;

  switch (event) {
    case 'charge.success': {
      if (reference) {
        const payment = await Payment.findOneAndUpdate(
          { providerReference: reference },
          { status: 'Paid', method: 'Paystack' },
          { new: true }
        );
        if (payment) {
          await AuditLog.create({
            action: `Payment ${payment.invoiceNo} confirmed via Paystack webhook`,
            category: 'Payment Events',
            user: 'Paystack Webhook',
            business: payment.business,
            ip: req.ip,
            device: 'Paystack',
          });
        }
      }
      break;
    }
    case 'refund.processed':
    case 'refund.processing': {
      if (reference) {
        const payment = await Payment.findOneAndUpdate(
          { providerReference: reference },
          { status: 'Refunded' },
          { new: true }
        );
        if (payment) {
          await AuditLog.create({
            action: `Payment ${payment.invoiceNo} refund confirmed via Paystack webhook`,
            category: 'Payment Events',
            user: 'Paystack Webhook',
            business: payment.business,
            ip: req.ip,
            device: 'Paystack',
          });
        }
      }
      break;
    }
    case 'charge.failed': {
      if (reference) {
        await Payment.findOneAndUpdate({ providerReference: reference }, { status: 'Failed' });
      }
      break;
    }
    default:
      // Unhandled event type — acknowledge and ignore.
      break;
  }

  res.status(200).json({ received: true });
});

export default { handlePaystackWebhook };
