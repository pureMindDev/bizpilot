import Staff from '../models/Staff.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate, buildMeta } from '../utils/paginate.js';

export const listPlatformUsers = asyncHandler(async (req, res) => {
  const { search = '', role = 'All' } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (role !== 'All') filter.role = role;

  const users = await Staff.find(filter).populate('business', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Staff.countDocuments(filter);

  let data = users.map((u) => ({ ...u.toObject(), business: u.business?.name || 'Unknown' }));
  if (search) {
    const q = search.toLowerCase();
    data = data.filter((u) => u.name.toLowerCase().includes(q) || u.business.toLowerCase().includes(q));
  }

  res.json({ success: true, data, meta: buildMeta({ total, page, limit }) });
});

export const suspendPlatformUser = asyncHandler(async (req, res) => {
  const user = await Staff.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  user.status = user.status === 'suspended' ? 'active' : 'suspended';
  await user.save();
  res.json({ success: true, data: user });
});

export const deletePlatformUser = asyncHandler(async (req, res) => {
  const user = await Staff.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, message: 'User deleted' });
});
