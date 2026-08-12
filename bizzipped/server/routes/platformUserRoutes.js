import { Router } from 'express';
import { listPlatformUsers, suspendPlatformUser, deletePlatformUser } from '../controllers/platformUserController.js';
import { protectAdmin } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/', listPlatformUsers);
router.patch('/:id/suspend', suspendPlatformUser);
router.delete('/:id', deletePlatformUser);

export default router;
