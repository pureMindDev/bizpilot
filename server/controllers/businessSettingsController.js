import Business from '../models/Business.js';
import Staff from '../models/Staff.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getMyBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.businessId);
  if (!business) throw ApiError.notFound('Business not found');
  res.json({ success: true, data: business });
});

export const updateMyBusiness = asyncHandler(async (req, res) => {
  const disallowed = ['status', 'plan', '_id'];
  const updates = { ...req.body };
  disallowed.forEach((k) => delete updates[k]);

  const business = await Business.findById(req.businessId);
  if (!business) throw ApiError.notFound('Business not found');

  // notificationPreferences is a nested object — a plain findByIdAndUpdate
  // would replace the whole subdocument, silently wiping out any sibling
  // toggles that weren't part of this particular request. Merge explicitly.
  if (updates.notificationPreferences) {
    const current = business.notificationPreferences?.toObject?.() ?? business.notificationPreferences ?? {};
    business.notificationPreferences = { ...current, ...updates.notificationPreferences };
    delete updates.notificationPreferences;
  }

  Object.assign(business, updates);
  await business.save();

  res.json({ success: true, data: business });
});

// DELETE /api/business — permanently deletes the business and everything
// tied to it. Restricted to Owner at the route level.
export const deleteMyBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.businessId);
  if (!business) throw ApiError.notFound('Business not found');

  await Promise.all([
    Staff.deleteMany({ business: business._id }),
    Product.deleteMany({ business: business._id }),
    Customer.deleteMany({ business: business._id }),
    Sale.deleteMany({ business: business._id }),
    Expense.deleteMany({ business: business._id }),
    Notification.deleteMany({ business: business._id }),
  ]);
  await business.deleteOne();

  res.json({ success: true, message: 'Your business account and all associated data have been permanently deleted.' });
});
