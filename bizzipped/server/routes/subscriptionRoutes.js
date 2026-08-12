import { Router } from 'express';
import { startCheckout, verifyCheckout } from '../controllers/subscriptionController.js';
import { protectBusiness, requireRole } from '../middlewares/auth.js';

const router = Router();
router.use(protectBusiness);

// Only the Owner can spend the business's money.
router.post('/checkout', requireRole('Owner'), startCheckout);
router.get('/verify/:reference', verifyCheckout);

export default router;
