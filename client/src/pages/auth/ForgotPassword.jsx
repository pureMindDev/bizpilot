import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPassword() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="badge badge-success" style={{ display: 'flex', padding: '12px 14px', width: '100%', marginBottom: 18 }}>
          <FiCheckCircle size={15} /> We sent a reset link to {getValues('email')}
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 22 }}>
          Didn't get the email? Check your spam folder, or try again with a different address.
        </p>
        <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
          <FiArrowLeft size={15} /> Back to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link.">
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
        <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
          Send reset link
        </Button>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
