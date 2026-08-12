import Business from '../models/Business.js';
import Staff from '../models/Staff.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate, buildMeta } from '../utils/paginate.js';
import { enrichBusiness, enrichBusinesses } from '../services/adminBusinessService.js';

export const listBusinesses = asyncHandler(async (req, res) => {
  const { search = '', plan = 'All', status = 'All' } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { owner: new RegExp(search, 'i') }];
  if (plan !== 'All') filter.plan = plan;
  if (status !== 'All') filter.status = status;

  const [businesses, total] = await Promise.all([
    Business.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Business.countDocuments(filter),
  ]);

  const enriched = await enrichBusinesses(businesses);

  res.json({ success: true, data: enriched, meta: buildMeta({ total, page, limit }) });
});

export const getBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) throw ApiError.notFound('Business not found');

  res.json({ success: true, data: await enrichBusiness(business) });
});

export const updateBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!business) throw ApiError.notFound('Business not found');

  await AuditLog.create({
    action: 'Updated business details',
    category: 'Business Creation',
    user: req.admin.name,
    business: business._id,
    ip: req.ip,
    device: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ success: true, data: business });
});

export const suspendBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) throw ApiError.notFound('Business not found');
  business.status = 'Suspended';
  await business.save();

  await AuditLog.create({ action: 'Suspended business account', category: 'Business Creation', user: req.admin.name, business: business._id, ip: req.ip, device: req.headers['user-agent'] || 'Unknown' });
  res.json({ success: true, data: business });
});

export const activateBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) throw ApiError.notFound('Business not found');
  business.status = 'Active';
  await business.save();

  await AuditLog.create({ action: 'Activated business account', category: 'Business Creation', user: req.admin.name, business: business._id, ip: req.ip, device: req.headers['user-agent'] || 'Unknown' });
  res.json({ success: true, data: business });
});

export const deleteBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findByIdAndDelete(req.params.id);
  if (!business) throw ApiError.notFound('Business not found');

  // Cascade-delete the tenant's data
  await Promise.all([
    Staff.deleteMany({ business: business._id }),
    Product.deleteMany({ business: business._id }),
    Sale.deleteMany({ business: business._id }),
  ]);

  await AuditLog.create({ action: 'Deleted business account', category: 'Business Creation', user: req.admin.name, ip: req.ip, device: req.headers['user-agent'] || 'Unknown' });
  res.json({ success: true, message: 'Business deleted' });
});

export const getPlatformStats = asyncHandler(async (req, res) => {
  const [total, active, trial, expired, suspended, totalUsers] = await Promise.all([
    Business.countDocuments(),
    Business.countDocuments({ status: 'Active' }),
    Business.countDocuments({ status: 'Trial' }),
    Business.countDocuments({ status: 'Expired' }),
    Business.countDocuments({ status: 'Suspended' }),
    Staff.countDocuments(),
  ]);
  res.json({ success: true, data: { total, active, trial, expired, suspended, totalUsers } });
});
