import { verifyBusinessToken } from '../services/tokenService.js';
import { ApiError } from '../utils/ApiError.js';
import Staff from '../models/Staff.js';

export const protectBusiness = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.bizpilot_token;
    if (!token) throw ApiError.unauthorized('No token provided');

    const decoded = verifyBusinessToken(token);
    const staff = await Staff.findById(decoded.id);
    if (!staff) throw ApiError.unauthorized('User no longer exists');
    if (staff.status === 'suspended') throw ApiError.forbidden('This account has been suspended');

    req.staff = staff;
    req.businessId = staff.business.toString();
    next();
  } catch (err) {
    next(err.statusCode ? err : ApiError.unauthorized('Invalid or expired token'));
  }
};

// Restrict a route to specific staff roles, e.g. requireRole('Owner', 'Manager')
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.staff || !roles.includes(req.staff.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

export default protectBusiness;
