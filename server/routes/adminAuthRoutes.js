import { Router } from 'express';
import { body } from 'express-validator';
import { adminLogin, getAdminMe } from '../controllers/adminAuthController.js';
import { protectAdmin } from '../middlewares/adminAuth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, adminLogin);
router.get('/me', protectAdmin, getAdminMe);

export default router;
