import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: { type: String, enum: ['stock', 'sale', 'staff', 'customer', 'payment'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ business: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
