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
    // Paystack's transaction reference — set when a payment originates from (or is
    // reconciled against) a real Paystack charge. Lets the webhook match an
    // incoming event to a Payment, and lets refunds target the right transaction.
    providerReference: { type: String, default: null, index: true, sparse: true },
  },
  { timestamps: true }
);

paymentSchema.index({ business: 1, date: -1 });

export default mongoose.model('Payment', paymentSchema);
