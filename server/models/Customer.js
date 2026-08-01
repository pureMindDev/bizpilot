import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    city: { type: String, default: '' },
    totalPurchases: { type: Number, default: 0 },
    outstandingDebt: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

customerSchema.index({ business: 1, name: 'text', email: 'text' });

export default mongoose.model('Customer', customerSchema);
