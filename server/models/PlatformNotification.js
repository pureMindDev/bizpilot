import mongoose from 'mongoose';

const platformNotificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['security', 'payment', 'business', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('PlatformNotification', platformNotificationSchema);
