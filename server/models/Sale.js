import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    items: { type: [saleItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Transfer', 'POS'], required: true },
    customer: { type: String, default: 'Walk-in Customer' },
    cashier: { type: String, default: '' },
  },
  { timestamps: true }
);

saleSchema.index({ business: 1, createdAt: -1 });

export default mongoose.model('Sale', saleSchema);
