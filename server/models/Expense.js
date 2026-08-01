import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    category: { type: String, enum: ['Rent', 'Salary', 'Fuel', 'Electricity', 'Internet', 'Maintenance', 'Other'], default: 'Other' },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    recordedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

expenseSchema.index({ business: 1, date: -1 });

export default mongoose.model('Expense', expenseSchema);
