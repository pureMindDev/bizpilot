import { Router } from 'express';
import { getPlatformSettings, updatePlatformSettings } from '../controllers/platformSettingsController.js';
import { protectAdmin, requireAdminRole } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/', getPlatformSettings);
router.patch('/', requireAdminRole('Super Admin', 'Developer'), updatePlatformSettings);

export default router;
