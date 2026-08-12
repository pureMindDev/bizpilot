import { Router } from 'express';
import {
  listPlatformNotifications, markPlatformNotificationRead, markAllPlatformNotificationsRead, deletePlatformNotification,
} from '../controllers/platformNotificationController.js';
import { protectAdmin } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/', listPlatformNotifications);
router.patch('/read-all', markAllPlatformNotificationsRead);
router.patch('/:id/read', markPlatformNotificationRead);
router.delete('/:id', deletePlatformNotification);

export default router;
