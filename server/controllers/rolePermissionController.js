import RolePermission from '../models/RolePermission.js';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const listRolePermissions = asyncHandler(async (req, res) => {
  const matrix = await RolePermission.find();
  const team = await Admin.find().select('name email role status');
  res.json({ success: true, data: { matrix, team } });
});

// PATCH /api/admin/roles/:role — body: { module, key, value }
export const togglePermission = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const { module, key, value } = req.body;
  if (role === 'Super Admin') throw ApiError.forbidden('Super Admin permissions cannot be modified');
  if (!['view', 'edit', 'delete'].includes(key)) throw ApiError.badRequest('key must be view, edit, or delete');

  const doc = await RolePermission.findOne({ role });
  if (!doc) throw ApiError.notFound('Role not found');

  const current = doc.permissions.get(module) || { view: false, edit: false, delete: false };
  current[key] = value ?? !current[key];
  doc.permissions.set(module, current);
  await doc.save();

  res.json({ success: true, data: doc });
});
