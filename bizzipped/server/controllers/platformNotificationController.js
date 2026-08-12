import PlatformNotification from '../models/PlatformNotification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const listPlatformNotifications = asyncHandler(async (req, res) => {
  const { type = 'All' } = req.query;
  const filter = {};
  if (type !== 'All') filter.type = type;
  const notifications = await PlatformNotification.find(filter).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await PlatformNotification.countDocuments({ read: false });
  res.json({ success: true, data: notifications, unreadCount });
});

export const markPlatformNotificationRead = asyncHandler(async (req, res) => {
  const notification = await PlatformNotification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!notification) throw ApiError.notFound('Notification not found');
  res.json({ success: true, data: notification });
});

export const markAllPlatformNotificationsRead = asyncHandler(async (req, res) => {
  await PlatformNotification.updateMany({ read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const deletePlatformNotification = asyncHandler(async (req, res) => {
  const notification = await PlatformNotification.findByIdAndDelete(req.params.id);
  if (!notification) throw ApiError.notFound('Notification not found');
  res.json({ success: true, message: 'Notification deleted' });
});
