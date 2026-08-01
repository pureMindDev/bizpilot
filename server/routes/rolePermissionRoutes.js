import { Router } from 'express';
import { listRolePermissions, togglePermission } from '../controllers/rolePermissionController.js';
import { protectAdmin, requireAdminRole } from '../middlewares/adminAuth.js';

const router = Router();
router.use(protectAdmin);

router.get('/', listRolePermissions);
router.patch('/:role', requireAdminRole('Super Admin'), togglePermission);

export default router;
