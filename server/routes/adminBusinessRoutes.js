import { Router } from 'express';
import {
  listBusinesses, getBusiness, updateBusiness, suspendBusiness, activateBusiness, deleteBusiness, getPlatformStats,
} from '../controllers/adminBusinessController.js';
import { protectAdmin } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/stats', getPlatformStats);
router.get('/', listBusinesses);
router.get('/:id', getBusiness);
router.patch('/:id', updateBusiness);
router.patch('/:id/suspend', suspendBusiness);
router.patch('/:id/activate', activateBusiness);
router.delete('/:id', deleteBusiness);

export default router;
