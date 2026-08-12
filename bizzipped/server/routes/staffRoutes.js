import { Router } from 'express';
import { body } from 'express-validator';
import { listStaff, getStaffMember, createStaff, updateStaff, suspendStaff, deleteStaff } from '../controllers/staffController.js';
import { protectBusiness, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(protectBusiness);

router.get('/', listStaff);
router.get('/:id', getStaffMember);
router.post(
  '/',
  requireRole('Owner', 'Manager'),
  [body('name').trim().notEmpty(), body('email').isEmail(), body('role').notEmpty()],
  validate,
  createStaff
);
router.patch('/:id', requireRole('Owner', 'Manager'), updateStaff);
router.patch('/:id/suspend', requireRole('Owner', 'Manager'), suspendStaff);
router.delete('/:id', requireRole('Owner'), deleteStaff);

export default router;
