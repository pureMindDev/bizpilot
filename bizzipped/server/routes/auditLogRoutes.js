import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditLogController.js';
import { protectAdmin } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/', listAuditLogs);

export default router;
