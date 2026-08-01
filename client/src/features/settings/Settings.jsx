import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUser, FiCreditCard, FiBell, FiShield, FiImage, FiAlertTriangle } from 'react-icons/fi';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import PasswordInput from '../../components/common/PasswordInput';
import Switch from '../../components/common/Switch';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { extractErrorMessage } from '../../utils/apiError';
import styles from './Settings.module.scss';

const TABS = [
  { id: 'business', label: 'Business', icon: FiUser },
  { id: 'billing', label: 'Currency & Tax', icon: FiCreditCard },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'security', label: 'Security', icon: FiShield },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your business preferences and account security</p>
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
          {activeTab === 'business' && <BusinessTab />}
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

function BusinessTab() {
  const { settings, updateSettings, loading } = useSettings();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: settings });

  // react-hook-form only reads defaultValues once at mount — since settings
  // arrives asynchronously from the API, we reset() once it's actually loaded.
  useEffect(() => {
    if (!loading) reset(settings);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data) => {
    try {
      await updateSettings(data);
      toast.success('Business information updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className={styles.sectionHeading}>Business information</h3>
      <p className={styles.sectionSub}>This appears on receipts and reports.</p>

      <div className="form-group">
        <label className="form-label">Business logo</label>
        <div className={styles.logoUpload}>
          <div className={styles.logoPreview}><FiImage size={22} /></div>
          <div>
            <button type="button" className="btn btn-secondary btn-sm">Upload logo</button>
            <p className={styles.hint}>PNG or JPG, at least 200×200px</p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Business name</label>
        <input className="form-input" {...register('businessName')} />
      </div>
      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Business email</label>
          <input type="email" className="form-input" {...register('businessEmail')} />
        </div>
        <div className="form-group">
          <label className="form-label">Business phone</label>
          <input className="form-input" {...register('businessPhone')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea className="form-textarea" rows={2} {...register('address')} />
      </div>
      <Button type="submit" variant="primary" loading={isSubmitting}>Save changes</Button>
    </form>
  );
}

function BillingTab() {
  const { settings, updateSettings, loading } = useSettings();
  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm({ defaultValues: settings });
  const taxEnabled = watch('taxEnabled');

  useEffect(() => {
    if (!loading) reset(settings);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data) => {
    try {
      await updateSettings({ ...data, taxEnabled: !!data.taxEnabled, taxRate: Number(data.taxRate) });
      toast.success('Currency & tax settings updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className={styles.sectionHeading}>Currency & language</h3>
      <p className={styles.sectionSub}>Set how prices and dates appear across your dashboard.</p>
      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Currency</label>
          <select className="form-select" {...register('currency')}>
            <option value="NGN">Nigerian Naira (₦)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Language</label>
          <select className="form-select" {...register('language')}>
            <option value="English">English</option>
            <option value="Yoruba">Yoruba</option>
            <option value="Hausa">Hausa</option>
            <option value="Igbo">Igbo</option>
          </select>
        </div>
      </div>

      <h3 className={styles.sectionHeading} style={{ marginTop: 26 }}>Tax settings</h3>
      <div className={styles.toggleRow}>
        <div>
          <p className={styles.toggleTitle}>Enable tax on sales</p>
          <p className={styles.toggleSub}>Automatically apply tax during checkout</p>
        </div>
        <Switch checked={!!taxEnabled} onChange={(v) => setValue('taxEnabled', v)} />
      </div>

      <div className="form-group" style={{ maxWidth: 200, marginTop: 14 }}>
        <label className="form-label">Tax rate (%)</label>
        <input type="number" step="0.1" className="form-input" {...register('taxRate')} />
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting}>Save changes</Button>
    </form>
  );
}

function NotificationsTab() {
  const { settings, updateSettings } = useSettings();
  const items = [
    { key: 'notifyLowStock', title: 'Low stock alerts', sub: 'Get notified when a product falls below its reorder level' },
    { key: 'notifyNewSale', title: 'New sale notifications', sub: 'Get notified whenever a new sale is recorded' },
    { key: 'notifyStaffLogin', title: 'Staff login alerts', sub: 'Get notified when a staff member logs in' },
    { key: 'notifyPayment', title: 'Payment received', sub: 'Get notified when a payment is received' },
  ];

  const handleToggle = async (key, value) => {
    try {
      await updateSettings({ [key]: value });
      toast.success('Preference updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <h3 className={styles.sectionHeading}>Notification preferences</h3>
      <p className={styles.sectionSub}>Choose what you want to be notified about.</p>
      {items.map((item) => (
        <div key={item.key} className={styles.toggleRow}>
          <div>
            <p className={styles.toggleTitle}>{item.title}</p>
            <p className={styles.toggleSub}>{item.sub}</p>
          </div>
          <Switch checked={!!settings[item.key]} onChange={(v) => handleToggle(item.key, v)} />
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  const { theme, setTheme } = useTheme();
  const { changePassword, deleteAccount } = useAuth();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const onSubmit = async (data) => {
    try {
      await changePassword({ currentPassword: data.current, newPassword: data.new });
      toast.success('Password changed successfully');
      reset();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted');
      setDeleteOpen(false);
      // deleteAccount() already logs out; ProtectedRoute will redirect to /login.
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  return (
    <div>
      <h3 className={styles.sectionHeading}>Appearance</h3>
      <div className={styles.toggleRow}>
        <div>
          <p className={styles.toggleTitle}>Dark mode</p>
          <p className={styles.toggleSub}>Switch between light and dark themes</p>
        </div>
        <Switch checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} />
      </div>

      <h3 className={styles.sectionHeading} style={{ marginTop: 26 }}>Change password</h3>
      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 380 }}>
        <div className="form-group">
          <label className="form-label">Current password</label>
          <PasswordInput register={register} name="current" placeholder="Enter current password" rules={{ required: 'Current password is required' }} />
        </div>
        <div className="form-group">
          <label className="form-label">New password</label>
          <PasswordInput register={register} name="new" placeholder="Enter new password" rules={{ required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }} />
        </div>
        <Button type="submit" variant="primary" loading={isSubmitting}>Update password</Button>
      </form>

      <h3 className={styles.sectionHeading} style={{ marginTop: 30, color: '#EF4444' }}>Danger zone</h3>
      <div className={styles.dangerBox}>
        <div>
          <p className={styles.toggleTitle}>Delete account</p>
          <p className={styles.toggleSub}>Permanently delete your account and all associated data.</p>
        </div>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete account</Button>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?" width={440}
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" disabled={confirmText !== 'DELETE'} loading={deleting} onClick={handleDelete}>
            Delete permanently
          </Button>
        </>}>
        <div style={{ display: 'flex', gap: 10, background: '#FEE2E2', color: '#B91C1C', padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
          <FiAlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          This will permanently delete your business data, including products, sales, and customer records. This cannot be undone.
        </div>
        <label className="form-label">Type DELETE to confirm</label>
        <input className="form-input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
      </Modal>
    </div>
  );
}
