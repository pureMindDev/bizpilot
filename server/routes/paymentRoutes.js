import { Router } from 'express';
import { listPayments, refundPayment, getRevenueGrowth } from '../controllers/paymentController.js';
import { protectAdmin, requireAdminRole } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/', listPayments);
router.get('/revenue-growth', getRevenueGrowth);
router.patch('/:id/refund', requireAdminRole('Super Admin', 'Finance'), refundPayment);

export default router;
