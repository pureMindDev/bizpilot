import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: 'platform_settings', unique: true },
    platformName: { type: String, default: 'BizPilot' },
    primaryColor: { type: String, default: '#2563EB' },
    currency: { type: String, default: 'NGN' },
    language: { type: String, default: 'English' },
    smtpHost: { type: String, default: '' },
    smtpPort: { type: String, default: '587' },
    smtpUser: { type: String, default: '' },
    smsProvider: { type: String, default: 'Termii' },
    paystackEnabled: { type: Boolean, default: true },
    flutterwaveEnabled: { type: Boolean, default: true },
    stripeEnabled: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    twoFactorEnabled: { type: Boolean, default: true },
    passwordMinLength: { type: Number, default: 8 },
    passwordRequireSymbol: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    autoBackup: { type: Boolean, default: true },
    backupFrequency: { type: String, default: 'Daily' },
  },
  { timestamps: true }
);

export default mongoose.model('PlatformSettings', platformSettingsSchema);
