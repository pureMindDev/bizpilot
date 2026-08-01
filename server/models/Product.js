import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true },
    category: { type: String, default: 'Uncategorized' },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, default: 15 },
    supplier: { type: String, default: '' },
    barcode: { type: String, default: '' },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

productSchema.index({ business: 1, sku: 1 }, { unique: true });
productSchema.index({ business: 1, name: 'text' });

export default mongoose.model('Product', productSchema);
