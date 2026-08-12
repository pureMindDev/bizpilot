import Staff from '../models/Staff.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { assertWithinPlanLimit } from '../services/planLimitService.js';

export const listStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ business: req.businessId }).sort({ createdAt: -1 });
  res.json({ success: true, data: staff });
});

export const getStaffMember = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, business: req.businessId });
  if (!staff) throw ApiError.notFound('Staff member not found');
  res.json({ success: true, data: staff });
});

// POST /api/staff — invites a new staff member with a temporary password
export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, phone, role, password } = req.body;
  const existing = await Staff.findOne({ business: req.businessId, email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('A staff member with this email already exists');

  await assertWithinPlanLimit(req.businessId, 'staff');

  const passwordHash = await Staff.hashPassword(password || 'bizpilot123');
  const staff = await Staff.create({
    business: req.businessId,
    name,
    email,
    phone,
    role,
    passwordHash,
    activity: [{ action: 'Account created' }],
  });

  res.status(201).json({ success: true, data: staff });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  delete updates.passwordHash;
  const staff = await Staff.findOneAndUpdate({ _id: req.params.id, business: req.businessId }, updates, { new: true, runValidators: true });
  if (!staff) throw ApiError.notFound('Staff member not found');
  res.json({ success: true, data: staff });
});

export const suspendStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, business: req.businessId });
  if (!staff) throw ApiError.notFound('Staff member not found');
  staff.status = staff.status === 'suspended' ? 'active' : 'suspended';
  await staff.save();
  res.json({ success: true, data: staff });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOneAndDelete({ _id: req.params.id, business: req.businessId });
  if (!staff) throw ApiError.notFound('Staff member not found');
  res.json({ success: true, message: 'Staff member removed' });
});
