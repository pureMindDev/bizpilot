import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  { action: { type: String, required: true }, time: { type: Date, default: Date.now } },
  { _id: false }
);

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
    logo: { type: String, default: null },
    plan: { type: String, enum: ['Free', 'Starter', 'Growth', 'Enterprise'], default: 'Free' },
    status: { type: String, enum: ['Active', 'Trial', 'Expired', 'Suspended'], default: 'Trial' },
    currency: { type: String, default: 'NGN' },
    language: { type: String, default: 'English' },
    taxRate: { type: Number, default: 7.5 },
    taxEnabled: { type: Boolean, default: true },
    renewalDate: { type: Date, default: () => new Date(Date.now() + 30 * 86400000) },
    notificationPreferences: {
      lowStock: { type: Boolean, default: true },
      newSale: { type: Boolean, default: true },
      staffLogin: { type: Boolean, default: false },
      payment: { type: Boolean, default: true },
    },
    activity: { type: [activitySchema], default: [] },
  },
  { timestamps: true }
);

businessSchema.index({ name: 'text', owner: 'text' });

businessSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  return obj;
};

export default mongoose.model('Business', businessSchema);
