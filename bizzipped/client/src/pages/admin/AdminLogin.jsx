import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiShield } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome to the platform console.');
      navigate('/admin/dashboard');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Platform Console" subtitle="Restricted access — BizPilot Super Admin team only.">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-hover)',
        border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 12.5, color: 'var(--text-secondary)',
      }}>
        <FiShield size={16} style={{ flexShrink: 0, color: 'var(--primary)' }} />
        This console is separate from the business dashboard and is only accessible to authorized BizPilot staff.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className="badge badge-danger" style={{ display: 'flex', marginBottom: 16, padding: '10px 14px', width: '100%' }}>
            <FiAlertCircle size={14} /> {serverError}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">Admin email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@bizpilot.ng"
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <PasswordInput
            register={register}
            name="password"
            rules={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
          />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>

        <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
          Sign in to console
        </Button>

        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 20 }}>
          Not a platform admin? <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Go to business login</a>
        </p>
      </form>
    </AuthLayout>
  );
}
