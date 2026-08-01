import PlatformSettings from '../models/PlatformSettings.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getOrCreateSettings = async () => {
  let settings = await PlatformSettings.findOne({ singletonKey: 'platform_settings' });
  if (!settings) settings = await PlatformSettings.create({});
  return settings;
};

export const getPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
});

export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  Object.assign(settings, req.body);
  await settings.save();

  await AuditLog.create({
    action: 'Updated platform settings',
    category: 'Settings Changes',
    user: req.admin.name,
    ip: req.ip,
    device: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ success: true, data: settings });
});
