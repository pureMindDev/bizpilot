import crypto from 'crypto';
import { env } from '../config/env.js';

const PAYSTACK_API = 'https://api.paystack.co';

export const isPaystackConfigured = () => Boolean(env.paystack.secretKey);

/**
 * Paystack signs webhook payloads with HMAC-SHA512 over the raw request body,
 * using your secret key, and sends the result in the `x-paystack-signature`
 * header. Recomputing it and comparing (timing-safe) is the only way to trust
 * that a webhook call actually came from Paystack and not a spoofed request.
 * https://paystack.com/docs/payments/webhooks/#verifying-events
 */
export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!env.paystack.secretKey || !signatureHeader || !rawBody) return false;

  const expected = crypto.createHmac('sha512', env.paystack.secretKey).update(rawBody).digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

/**
 * Calls Paystack's refund API for a given transaction reference. Only called
 * when PAYSTACK_SECRET_KEY is configured — see refundPayment in
 * paymentController.js for the local-dev fallback when it isn't.
 */
export const requestPaystackRefund = async (reference, amountKobo) => {
  const res = await fetch(`${PAYSTACK_API}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.paystack.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transaction: reference, ...(amountKobo ? { amount: amountKobo } : {}) }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === false) {
    throw new Error(data?.message || `Paystack refund request failed (${res.status})`);
  }
  return data;
};

export default { isPaystackConfigured, verifyWebhookSignature, requestPaystackRefund };
