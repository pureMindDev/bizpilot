import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ business: req.businessId }).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ business: req.businessId, read: false });
  res.json({ success: true, data: notifications, unreadCount });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, business: req.businessId }, { read: true }, { new: true });
  if (!notification) throw ApiError.notFound('Notification not found');
  res.json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ business: req.businessId, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, business: req.businessId });
  if (!notification) throw ApiError.notFound('Notification not found');
  res.json({ success: true, message: 'Notification deleted' });
});
