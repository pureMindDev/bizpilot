import { Router } from 'express';
import {
  getDashboardSummary, getRevenueOverview, getTopProducts, getRevenueByPaymentMethod, getReportsSummary,
} from '../controllers/dashboardController.js';
import { protectBusiness } from '../middlewares/auth.js';

const router = Router();
router.use(protectBusiness);

router.get('/summary', getDashboardSummary);
router.get('/revenue-overview', getRevenueOverview);
router.get('/top-products', getTopProducts);
router.get('/revenue-by-payment-method', getRevenueByPaymentMethod);
router.get('/reports-summary', getReportsSummary);

export default router;
