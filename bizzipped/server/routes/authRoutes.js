import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, forgotPassword, resetPassword, verifyEmail, resendVerification, changePassword } from '../controllers/authController.js';
import { protectBusiness } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post(
  '/register',
  [body('name').trim().notEmpty(), body('business').trim().notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate,
  register
);
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, login);
router.post('/verify-email', [body('email').isEmail(), body('code').isLength({ min: 6, max: 6 })], validate, verifyEmail);
router.post('/resend-verification', [body('email').isEmail()], validate, resendVerification);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.post(
  '/reset-password',
  [body('email').isEmail(), body('code').isLength({ min: 6, max: 6 }), body('password').isLength({ min: 6 })],
  validate,
  resetPassword
);
router.get('/me', protectBusiness, getMe);
router.post(
  '/change-password',
  protectBusiness,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate,
  changePassword
);

export default router;
