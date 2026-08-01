import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    invoiceNo: { type: String, required: true, unique: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['Paystack', 'Flutterwave', 'Stripe', 'Bank Transfer'], required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paymentSchema.index({ business: 1, date: -1 });

export default mongoose.model('Payment', paymentSchema);
