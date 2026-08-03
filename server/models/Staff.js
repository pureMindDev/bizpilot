import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const staffSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['Owner', 'Manager', 'Cashier', 'Sales Rep', 'Inventory Officer'], default: 'Cashier' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },
    resetCode: { type: String, select: false },
    resetCodeExpires: { type: Date, select: false },
    lastActive: { type: Date, default: Date.now },
    activity: { type: [{ action: String, time: { type: Date, default: Date.now } }], default: [] },
  },
  { timestamps: true }
);

staffSchema.index({ business: 1, email: 1 }, { unique: true });

staffSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

staffSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
};

export default mongoose.model('Staff', staffSchema);
