import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate, buildMeta } from '../utils/paginate.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { search = '', category = 'All' } = req.query;
  const { page, limit, skip } = paginate({ ...req.query, limit: req.query.limit || 50 });

  const filter = {};
  if (category !== 'All') filter.category = category;
  if (search) filter.$or = [{ action: new RegExp(search, 'i') }, { user: new RegExp(search, 'i') }];

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('business', 'name').sort({ time: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  const data = logs.map((l) => ({ ...l.toObject(), business: l.business?.name || '—' }));
  res.json({ success: true, data, meta: buildMeta({ total, page, limit }) });
});
