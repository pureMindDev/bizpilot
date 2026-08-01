import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    category: {
      type: String,
      enum: ['Login', 'Password Changes', 'Business Creation', 'Subscription Changes', 'Payment Events', 'Role Changes', 'Settings Changes'],
      required: true,
    },
    user: { type: String, required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null },
    ip: { type: String, default: '' },
    device: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'time', updatedAt: false } }
);

auditLogSchema.index({ time: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
