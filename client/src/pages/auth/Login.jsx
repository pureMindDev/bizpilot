import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email to continue.');
        navigate('/verify-email', { state: { email: data.email } });
        return;
      }
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your BizPilot dashboard.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className="badge badge-danger" style={{ display: 'flex', marginBottom: 16, padding: '10px 14px', width: '100%' }}>
            <FiAlertCircle size={14} /> {serverError}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@business.com"
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <Link to="/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Forgot password?</Link>
          </div>
          <PasswordInput
            register={register}
            name="password"
            rules={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
          />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>

        <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
          Log in
        </Button>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 20 }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up free</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
