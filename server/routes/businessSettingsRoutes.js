import { Router } from 'express';
import { getMyBusiness, updateMyBusiness, deleteMyBusiness } from '../controllers/businessSettingsController.js';
import { protectBusiness, requireRole } from '../middlewares/auth.js';

const router = Router();
router.use(protectBusiness);

router.get('/', getMyBusiness);
router.patch('/', requireRole('Owner', 'Manager'), updateMyBusiness);
router.delete('/', requireRole('Owner'), deleteMyBusiness);

export default router;
