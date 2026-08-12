import { isDbConnected } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const requireDb = (req, res, next) => {
  if (!isDbConnected()) {
    return next(new ApiError(503, 'Database is not currently connected. Please try again shortly.'));
  }
  next();
};

export default requireDb;
