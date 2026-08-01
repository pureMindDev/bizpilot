import Plan from '../models/Plan.js';
import Business from '../models/Business.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const PLAN_ORDER = ['Starter', 'Growth', 'Enterprise'];

export const listPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find().sort({ price: 1 });
  res.json({ success: true, data: plans });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  res.json({ success: true, data: plan });
});

// PATCH /api/admin/subscriptions/:businessId/change — action: upgrade | downgrade | trial | cancel
export const changeBusinessSubscription = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const business = await Business.findById(req.params.businessId);
  if (!business) throw ApiError.notFound('Business not found');

  const currentIndex = PLAN_ORDER.indexOf(business.plan);
  let logAction = '';

  if (action === 'upgrade') {
    business.plan = PLAN_ORDER[Math.min(currentIndex + 1, PLAN_ORDER.length - 1)];
    logAction = `Upgraded subscription to ${business.plan}`;
  } else if (action === 'downgrade') {
    business.plan = PLAN_ORDER[Math.max(currentIndex - 1, 0)];
    logAction = `Downgraded subscription to ${business.plan}`;
  } else if (action === 'trial') {
    business.status = 'Trial';
    business.renewalDate = new Date(Date.now() + 14 * 86400000);
    logAction = 'Moved business to a 14-day trial';
  } else if (action === 'cancel') {
    business.status = 'Expired';
    logAction = 'Cancelled subscription';
  } else {
    throw ApiError.badRequest('action must be one of: upgrade, downgrade, trial, cancel');
  }

  await business.save();
  await AuditLog.create({
    action: logAction,
    category: 'Subscription Changes',
    user: req.admin.name,
    business: business._id,
    ip: req.ip,
    device: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ success: true, data: business });
});
