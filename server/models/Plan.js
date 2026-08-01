import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ['Starter', 'Growth', 'Enterprise'], required: true, unique: true },
    price: { type: Number, required: true },
    interval: { type: String, default: 'month' },
    userLimit: { type: Number, required: true },
    productLimit: { type: Number, required: true },
    storageLimit: { type: String, required: true },
    features: { type: [String], default: [] },
    color: { type: String, default: '#2563EB' },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
