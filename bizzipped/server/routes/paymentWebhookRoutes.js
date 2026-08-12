import { Router } from 'express';
import { handlePaystackWebhook } from '../controllers/paymentWebhookController.js';

const router = Router();

// No auth middleware here on purpose — Paystack calls this directly, not a
// logged-in admin. Trust is established via handlePaystackWebhook's HMAC
// signature check instead of a bearer token.
router.post('/paystack', handlePaystackWebhook);

export default router;
