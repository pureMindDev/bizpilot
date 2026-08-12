import { Router } from 'express';
import {
  getAdminDashboardSummary, getBusinessGrowth, getPlanDistribution, getMonthlySignups, getTopBusinesses,
} from '../controllers/adminDashboardController.js';
import { protectAdmin } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/summary', getAdminDashboardSummary);
router.get('/business-growth', getBusinessGrowth);
router.get('/plan-distribution', getPlanDistribution);
router.get('/monthly-signups', getMonthlySignups);
router.get('/top-businesses', getTopBusinesses);

export default router;
