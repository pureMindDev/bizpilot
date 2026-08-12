import Admin from '../models/Admin.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { signAdminToken } from '../services/tokenService.js';

// POST /api/admin/auth/login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Email and password are required');

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!admin || !(await admin.comparePassword(password))) throw ApiError.unauthorized('Incorrect email or password');
  if (admin.status === 'suspended') throw ApiError.forbidden('This admin account has been suspended');

  await AuditLog.create({
    action: 'Logged in',
    category: 'Login',
    user: admin.name,
    ip: req.ip,
    device: req.headers['user-agent'] || 'Unknown',
  });

  const token = signAdminToken({ id: admin._id.toString() });
  res.json({
    success: true,
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

// GET /api/admin/auth/me
export const getAdminMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: req.admin.role },
  });
});
