import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUser, FiCreditCard, FiPackage, FiBell, FiShield, FiImage, FiAlertTriangle, FiShoppingCart, FiUserCheck, FiMoon, FiLock, FiTrash2 } from 'react-icons/fi';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import PasswordInput from '../../components/common/PasswordInput';
import Switch from '../../components/common/Switch';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import PlanTab from './components/PlanTab';
import { extractErrorMessage } from '../../utils/apiError';
import styles from './Settings.module.scss';

const TABS = [
  { id: 'business', label: 'Business', icon: FiUser },
  { id: 'plan', label: 'Plan & Billing', icon: FiPackage },
  { id: 'billing', label: 'Currency & Tax', icon: FiCreditCard },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'security', label: 'Security', icon: FiShield },
];

const TAB_IDS = TABS.map((t) => t.id);

export default function Settings() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(TAB_IDS.includes(requestedTab) ? requestedTab : 'business');

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
              <span className={styles.tabIcon}><t.icon size={14} /></span>
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.panel}>
          {activeTab === 'business' && <BusinessTab />}
          {activeTab === 'plan' && <PlanTab />}
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, subtitle }) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionIcon}><Icon size={17} /></span>
      <div>
        <h3 className={styles.sectionHeading}>{title}</h3>
        <p className={styles.sectionSub}>{subtitle}</p>
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
      <SectionHead icon={FiUser} title="Business information" subtitle="This appears on receipts and reports." />

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
      <SectionHead icon={FiCreditCard} title="Currency & language" subtitle="Set how prices and dates appear across your dashboard." />
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

      <div className={styles.divider} />

      <h4 className={styles.subHeading}>Tax settings</h4>
      <div className={styles.toggleRow}>
        <div className={styles.toggleBody}>
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
    { key: 'notifyLowStock', icon: FiAlertTriangle, title: 'Low stock alerts', sub: 'Get notified when a product falls below its reorder level' },
    { key: 'notifyNewSale', icon: FiShoppingCart, title: 'New sale notifications', sub: 'Get notified whenever a new sale is recorded' },
    { key: 'notifyStaffLogin', icon: FiUserCheck, title: 'Staff login alerts', sub: 'Get notified when a staff member logs in' },
    { key: 'notifyPayment', icon: FiCreditCard, title: 'Payment received', sub: 'Get notified when a payment is received' },
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
      <SectionHead icon={FiBell} title="Notification preferences" subtitle="Choose what you want to be notified about." />
      {items.map((item) => (
        <div key={item.key} className={styles.toggleRow}>
          <span className={styles.toggleIcon}><item.icon size={15} /></span>
          <div className={styles.toggleBody}>
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
      <SectionHead icon={FiShield} title="Security" subtitle="Manage your appearance, password, and account." />

      <div className={styles.toggleRow}>
        <span className={styles.toggleIcon}><FiMoon size={15} /></span>
        <div className={styles.toggleBody}>
          <p className={styles.toggleTitle}>Dark mode</p>
          <p className={styles.toggleSub}>Switch between light and dark themes</p>
        </div>
        <Switch checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} />
      </div>

      <div className={styles.divider} />

      <h4 className={styles.subHeading}><FiLock size={13} style={{ marginRight: 7, verticalAlign: -1 }} />Change password</h4>
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

      <div className={styles.divider} />

      <h4 className={styles.subHeading} style={{ color: '#EF4444' }}>Danger zone</h4>
      <div className={styles.dangerZone}>
        <div className={styles.dangerBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className={styles.dangerIcon}><FiTrash2 size={15} /></span>
            <div>
              <p className={styles.toggleTitle}>Delete account</p>
              <p className={styles.toggleSub}>Permanently delete your account and all associated data.</p>
            </div>
          </div>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete account</Button>
        </div>
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
