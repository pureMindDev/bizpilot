import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function ResetPassword() {
  const location = useLocation();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { email: location.state?.email || '' },
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { resetPassword, forgotPassword } = useAuth();
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const password = watch('password');
  const email = watch('email');

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await resetPassword({ email: data.email, code: data.code, password: data.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setServerError('Enter your email above first.');
      return;
    }
    setResending(true);
    try {
      await forgotPassword(email);
      toast.success('If that email exists, a new code has been sent.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Enter the code we emailed you and choose a strong new password.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className="badge badge-danger" style={{ display: 'flex', marginBottom: 16, padding: '10px 14px', width: '100%' }}>
            <FiAlertCircle size={14} /> {serverError}
          </div>
        )}
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="form-input" placeholder="you@business.com"
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="code">6-digit reset code</label>
          <input id="code" className="form-input" placeholder="123456" maxLength={6} inputMode="numeric"
            style={{ letterSpacing: 4, fontWeight: 600 }}
            {...register('code', { required: 'Reset code is required', pattern: { value: /^\d{6}$/, message: 'Enter the 6-digit code from your email' } })} />
          {errors.code && <p className="form-error">{errors.code.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">New password</label>
          <PasswordInput register={register} name="password" rules={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }} />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
          <PasswordInput register={register} name="confirmPassword" placeholder="Re-enter new password"
            rules={{ required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' }} />
          {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
          Reset password
        </Button>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 20 }}>
          Didn't get a code?{' '}
          <button type="button" onClick={handleResend} disabled={resending} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none' }}>
            {resending ? 'Sending...' : 'Resend'}
          </button>
        </p>
        <p style={{ textAlign: 'center', fontSize: 13.5, marginTop: 8 }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
