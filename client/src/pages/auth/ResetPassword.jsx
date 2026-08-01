import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await resetPassword({ email: data.email, password: data.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Enter your email and choose a strong new password.">
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
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
