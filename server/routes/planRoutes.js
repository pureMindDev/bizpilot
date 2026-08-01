import { Router } from 'express';
import { listPlans, updatePlan, changeBusinessSubscription } from '../controllers/planController.js';
import { protectAdmin, requireAdminRole } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/', listPlans);
router.patch('/:id', requireAdminRole('Super Admin', 'Finance'), updatePlan);
router.patch('/business/:businessId/change', requireAdminRole('Super Admin', 'Finance', 'Operations'), changeBusinessSubscription);

export default router;
