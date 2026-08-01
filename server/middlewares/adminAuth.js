import { verifyAdminToken } from '../services/tokenService.js';
import { ApiError } from '../utils/ApiError.js';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.bizpilot_admin_token;
    if (!token) throw ApiError.unauthorized('No admin token provided');

    const decoded = verifyAdminToken(token);
    const admin = await Admin.findById(decoded.id);
    if (!admin) throw ApiError.unauthorized('Admin account no longer exists');
    if (admin.status === 'suspended') throw ApiError.forbidden('This admin account has been suspended');

    req.admin = admin;
    next();
  } catch (err) {
    next(err.statusCode ? err : ApiError.unauthorized('Invalid or expired admin token'));
  }
};

// Restrict a route to specific admin roles, e.g. requireAdminRole('Super Admin', 'Finance')
export const requireAdminRole = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

export default protectAdmin;
