import { Router } from 'express';
import { listNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protectBusiness } from '../middlewares/auth.js';

const router = Router();
router.use(protectBusiness);

router.get('/', listNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
