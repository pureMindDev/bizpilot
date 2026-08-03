import Business from '../models/Business.js';
import Staff from '../models/Staff.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { signBusinessToken } from '../services/tokenService.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { generateVerificationCode, VERIFICATION_CODE_TTL_MS, PASSWORD_RESET_CODE_TTL_MS } from '../utils/verificationCode.js';

const sendAuthResponse = (res, statusCode, staff, business) => {
  const token = signBusinessToken({ id: staff._id.toString(), businessId: business._id.toString() });
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      business: business.name,
      businessId: business._id,
    },
  });
};

// Guards against a Staff record whose referenced Business no longer exists
// (e.g. deleted manually, or left over from an interrupted registration).
// Rather than crash with "Cannot read properties of null", this removes the
// broken record so the email address becomes available to register again.
const assertHasBusiness = async (staff) => {
  if (staff.business) return;
  await Staff.deleteOne({ _id: staff._id });
  throw ApiError.notFound("This account's business record is missing, so it has been cleared. Please register again.");
};

const issueAndSendVerificationCode = async (staff) => {
  const code = generateVerificationCode();
  staff.verificationCode = code;
  staff.verificationCodeExpires = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
  await staff.save();
  await sendVerificationEmail({ to: staff.email, name: staff.name, code });
};

// POST /api/auth/register — creates a new business + its first Owner staff account,
// then emails a verification code. Does NOT log the user in yet — they must verify
// their email first via POST /api/auth/verify-email.
export const register = asyncHandler(async (req, res) => {
  const { name, business, email, password } = req.body;
  if (!name || !business || !email || !password) throw ApiError.badRequest('name, business, email and password are required');

  const existing = await Staff.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const businessDoc = await Business.create({
    name: business,
    owner: name,
    email,
    phone: req.body.phone || '',
    status: 'Trial',
    plan: 'Starter',
  });

  const passwordHash = await Staff.hashPassword(password);
  const staff = await Staff.create({
    business: businessDoc._id,
    name,
    email,
    passwordHash,
    role: 'Owner',
    emailVerified: false,
    activity: [{ action: 'Account created' }],
  });

  await issueAndSendVerificationCode(staff);

  await Notification.create({
    business: businessDoc._id,
    type: 'staff',
    title: 'Welcome to BizPilot!',
    message: `Your business "${businessDoc.name}" is ready. Start by adding your first products.`,
  });

  res.status(201).json({
    success: true,
    message: 'Account created. Check your email for a verification code.',
    email: staff.email,
  });
});

// POST /api/auth/verify-email — checks the code and, on success, completes login
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) throw ApiError.badRequest('Email and verification code are required');

  const staff = await Staff.findOne({ email: email.toLowerCase() }).select('+verificationCode +verificationCodeExpires').populate('business');
  if (!staff) throw ApiError.notFound('Account not found');
  if (staff.emailVerified) throw ApiError.badRequest('This account is already verified');

  if (!staff.verificationCode || staff.verificationCode !== code) throw ApiError.badRequest('Incorrect verification code');
  if (staff.verificationCodeExpires < new Date()) throw ApiError.badRequest('This code has expired. Please request a new one.');
  await assertHasBusiness(staff);

  staff.emailVerified = true;
  staff.verificationCode = undefined;
  staff.verificationCodeExpires = undefined;
  staff.activity.unshift({ action: 'Verified email' });
  await staff.save();

  sendAuthResponse(res, 200, staff, staff.business);
});

// POST /api/auth/resend-verification
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest('Email is required');

  const staff = await Staff.findOne({ email: email.toLowerCase() });
  if (!staff) throw ApiError.notFound('Account not found');
  if (staff.emailVerified) throw ApiError.badRequest('This account is already verified');

  await issueAndSendVerificationCode(staff);
  res.json({ success: true, message: 'A new verification code has been sent.' });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Email and password are required');

  const staff = await Staff.findOne({ email: email.toLowerCase() }).select('+passwordHash').populate('business');
  if (!staff || !(await staff.comparePassword(password))) throw ApiError.unauthorized('Incorrect email or password');
  if (staff.status === 'suspended') throw ApiError.forbidden('This account has been suspended');
  await assertHasBusiness(staff);
  if (!staff.emailVerified) throw ApiError.forbidden('Please verify your email before logging in.', 'EMAIL_NOT_VERIFIED');

  staff.lastActive = new Date();
  staff.activity.unshift({ action: 'Logged in' });
  staff.activity = staff.activity.slice(0, 20);
  await staff.save();

  sendAuthResponse(res, 200, staff, staff.business);
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.staff.business);
  res.json({
    success: true,
    user: {
      id: req.staff._id,
      name: req.staff.name,
      email: req.staff.email,
      role: req.staff.role,
      business: business?.name,
      businessId: business?._id,
    },
  });
});

// POST /api/auth/forgot-password — emails a 6-digit reset code (same pattern as
// email verification). Always responds with the same generic message regardless
// of whether the account exists, so this endpoint can't be used to enumerate
// registered emails.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest('Email is required');
  const staff = await Staff.findOne({ email: email.toLowerCase() });

  if (staff) {
    const code = generateVerificationCode();
    staff.resetCode = code;
    staff.resetCodeExpires = new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MS);
    await staff.save();
    await sendPasswordResetEmail({ to: staff.email, name: staff.name, code });
  }

  res.json({ success: true, message: 'If that email exists, a reset code has been sent.' });
});

// POST /api/auth/reset-password — requires the 6-digit code emailed by forgot-password.
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password || password.length < 6) {
    throw ApiError.badRequest('Email, reset code, and a password of at least 6 characters are required');
  }

  const staff = await Staff.findOne({ email: email.toLowerCase() }).select('+resetCode +resetCodeExpires');
  if (!staff || !staff.resetCode || staff.resetCode !== code) throw ApiError.badRequest('Incorrect or expired reset code');
  if (staff.resetCodeExpires < new Date()) throw ApiError.badRequest('This code has expired. Please request a new one.');

  staff.passwordHash = await Staff.hashPassword(password);
  staff.resetCode = undefined;
  staff.resetCodeExpires = undefined;
  staff.activity.unshift({ action: 'Reset password' });
  await staff.save();

  res.json({ success: true, message: 'Password reset successfully' });
});

// POST /api/auth/change-password — for a logged-in user changing their own password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    throw ApiError.badRequest('Current password and a new password of at least 6 characters are required');
  }

  const staff = await Staff.findById(req.staff._id).select('+passwordHash');
  if (!(await staff.comparePassword(currentPassword))) throw ApiError.unauthorized('Current password is incorrect');

  staff.passwordHash = await Staff.hashPassword(newPassword);
  staff.activity.unshift({ action: 'Changed password' });
  await staff.save();

  res.json({ success: true, message: 'Password changed successfully' });
});
