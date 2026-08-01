import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiGlobe, FiMail, FiCreditCard, FiShield, FiTool, FiKey, FiImage, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { usePlatformSettings } from '../../../contexts/PlatformSettingsContext';
import Switch from '../../../components/common/Switch';
import Button from '../../../components/common/Button';
import styles from '../../settings/Settings.module.scss';

const TABS = [
  { id: 'general', label: 'General', icon: FiGlobe },
  { id: 'email', label: 'Email & SMS', icon: FiMail },
  { id: 'payments', label: 'Payment Providers', icon: FiCreditCard },
  { id: 'security', label: 'Security', icon: FiShield },
  { id: 'system', label: 'System', icon: FiTool },
  { id: 'api', label: 'API Keys', icon: FiKey },
];

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Platform Settings</h1>
          <p>Configure global settings for the BizPilot platform</p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.tabList}>
          {TABS.map((t) => (
            <button key={t.id} className={`${styles.tabItem} ${activeTab === t.id ? styles.active : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 26, flex: 1 }}>
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'email' && <EmailTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'system' && <SystemTab />}
          {activeTab === 'api' && <ApiKeysTab />}
        </div>
      </div>
    </div>
  );
}

function GeneralTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const { register, handleSubmit } = useForm({ defaultValues: settings });
  const onSubmit = (data) => { updateSettings(data); toast.success('General settings saved'); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className={styles.sectionHeading}>Platform identity</h3>
      <p className={styles.sectionSub}>These settings apply across the entire BizPilot platform.</p>

      <div className="form-group">
        <label className="form-label">Platform logo</label>
        <div className={styles.logoUpload}>
          <div className={styles.logoPreview}><FiImage size={22} /></div>
          <div>
            <button type="button" className="btn btn-secondary btn-sm">Upload logo</button>
            <p className={styles.hint}>PNG or SVG, at least 200×200px</p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Platform name</label>
        <input className="form-input" {...register('platformName')} />
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Brand color</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" {...register('primaryColor')} style={{ width: 44, height: 40, border: '1px solid var(--border)', borderRadius: 8, padding: 2, background: 'var(--bg-input)' }} />
            <input className="form-input" {...register('primaryColor')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Default currency</label>
          <select className="form-select" {...register('currency')}>
            <option value="NGN">Nigerian Naira (₦)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ maxWidth: 260 }}>
        <label className="form-label">Default language</label>
        <select className="form-select" {...register('language')}>
          <option value="English">English</option>
          <option value="Yoruba">Yoruba</option>
          <option value="Hausa">Hausa</option>
          <option value="Igbo">Igbo</option>
        </select>
      </div>

      <Button type="submit" variant="primary">Save changes</Button>
    </form>
  );
}

function EmailTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const { register, handleSubmit } = useForm({ defaultValues: settings });
  const onSubmit = (data) => { updateSettings(data); toast.success('Email & SMS settings saved'); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className={styles.sectionHeading}>SMTP configuration</h3>
      <p className={styles.sectionSub}>Used for transactional and notification emails.</p>
      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">SMTP host</label>
          <input className="form-input" {...register('smtpHost')} />
        </div>
        <div className="form-group">
          <label className="form-label">SMTP port</label>
          <input className="form-input" {...register('smtpPort')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Sender email</label>
        <input className="form-input" {...register('smtpUser')} />
      </div>

      <h3 className={styles.sectionHeading} style={{ marginTop: 26 }}>SMS provider</h3>
      <div className="form-group" style={{ maxWidth: 260 }}>
        <label className="form-label">Provider</label>
        <select className="form-select" {...register('smsProvider')}>
          <option value="Termii">Termii</option>
          <option value="Twilio">Twilio</option>
          <option value="Africa's Talking">Africa's Talking</option>
        </select>
      </div>

      <Button type="submit" variant="primary">Save changes</Button>
    </form>
  );
}

function PaymentsTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const providers = [
    { key: 'paystackEnabled', name: 'Paystack', desc: 'Accept card, bank and USSD payments' },
    { key: 'flutterwaveEnabled', name: 'Flutterwave', desc: 'Accept payments across Africa' },
    { key: 'stripeEnabled', name: 'Stripe', desc: 'Accept international card payments' },
  ];

  return (
    <div>
      <h3 className={styles.sectionHeading}>Payment providers</h3>
      <p className={styles.sectionSub}>Enable or disable payment gateways available to businesses.</p>
      {providers.map((p) => (
        <div key={p.key} className={styles.toggleRow}>
          <div>
            <p className={styles.toggleTitle}>{p.name}</p>
            <p className={styles.toggleSub}>{p.desc}</p>
          </div>
          <Switch checked={settings[p.key]} onChange={(v) => { updateSettings({ [p.key]: v }); toast.success(`${p.name} ${v ? 'enabled' : 'disabled'}`); }} />
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const { register, handleSubmit, watch } = useForm({ defaultValues: settings });
  const twoFactor = watch('twoFactorEnabled');
  const requireSymbol = watch('passwordRequireSymbol');
  const onSubmit = (data) => { updateSettings(data); toast.success('Security settings saved'); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className={styles.sectionHeading}>Session & authentication</h3>
      <div className="form-group" style={{ maxWidth: 260 }}>
        <label className="form-label">Session timeout (minutes)</label>
        <input type="number" className="form-input" {...register('sessionTimeout')} />
      </div>

      <div className={styles.toggleRow}>
        <div>
          <p className={styles.toggleTitle}>Two-factor authentication</p>
          <p className={styles.toggleSub}>Require 2FA for all Super Admin accounts</p>
        </div>
        <Switch checked={!!twoFactor} onChange={(v) => updateSettings({ twoFactorEnabled: v })} />
      </div>

      <h3 className={styles.sectionHeading} style={{ marginTop: 26 }}>Password policy</h3>
      <div className="form-group" style={{ maxWidth: 260 }}>
        <label className="form-label">Minimum password length</label>
        <input type="number" className="form-input" {...register('passwordMinLength')} />
      </div>
      <div className={styles.toggleRow} style={{ borderBottom: 'none' }}>
        <div>
          <p className={styles.toggleTitle}>Require symbols</p>
          <p className={styles.toggleSub}>Passwords must include at least one special character</p>
        </div>
        <Switch checked={!!requireSymbol} onChange={(v) => updateSettings({ passwordRequireSymbol: v })} />
      </div>

      <Button type="submit" variant="primary">Save changes</Button>
    </form>
  );
}

function SystemTab() {
  const { settings, updateSettings } = usePlatformSettings();

  return (
    <div>
      <h3 className={styles.sectionHeading}>Maintenance mode</h3>
      <div className={styles.toggleRow}>
        <div>
          <p className={styles.toggleTitle}>Enable maintenance mode</p>
          <p className={styles.toggleSub}>Business dashboards will show a maintenance banner and block new logins</p>
        </div>
        <Switch checked={settings.maintenanceMode} onChange={(v) => { updateSettings({ maintenanceMode: v }); toast.success(v ? 'Maintenance mode enabled' : 'Maintenance mode disabled'); }} />
      </div>

      <h3 className={styles.sectionHeading} style={{ marginTop: 26 }}>Backups</h3>
      <div className={styles.toggleRow}>
        <div>
          <p className={styles.toggleTitle}>Automatic backups</p>
          <p className={styles.toggleSub}>Automatically back up platform data</p>
        </div>
        <Switch checked={settings.autoBackup} onChange={(v) => updateSettings({ autoBackup: v })} />
      </div>
      <div className="form-group" style={{ maxWidth: 220, marginTop: 14 }}>
        <label className="form-label">Backup frequency</label>
        <select className="form-select" value={settings.backupFrequency} onChange={(e) => updateSettings({ backupFrequency: e.target.value })}>
          <option value="Hourly">Hourly</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
        </select>
      </div>
      <div style={{ marginTop: 16 }}>
        <Button variant="secondary" onClick={() => toast.success('Backup started')}>Run backup now</Button>
      </div>
    </div>
  );
}

function ApiKeysTab() {
  const keys = [
    { label: 'Live API key', value: 'bzp_live_sk_4f8a2c9e1d0b7f3a6c5e2d1b8f9a0c3e' },
    { label: 'Test API key', value: 'bzp_test_sk_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' },
    { label: 'Webhook signing secret', value: 'whsec_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c' },
  ];

  const copy = (val) => { navigator.clipboard?.writeText(val); toast.success('Copied to clipboard'); };

  return (
    <div>
      <h3 className={styles.sectionHeading}>API keys</h3>
      <p className={styles.sectionSub}>Use these keys to integrate with the BizPilot platform API.</p>
      {keys.map((k) => (
        <div key={k.label} className="form-group">
          <label className="form-label">{k.label}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input mono" readOnly value={k.value} style={{ fontSize: 12.5, flex: 1, minWidth: 0 }} />
            <button className="btn btn-secondary btn-icon" onClick={() => copy(k.value)}><FiCopy size={14} /></button>
            <button className="btn btn-secondary btn-icon" onClick={() => toast.success(`${k.label} regenerated`)}><FiRefreshCw size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
