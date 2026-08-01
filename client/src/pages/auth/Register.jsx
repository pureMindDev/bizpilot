import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const result = await signUp(data);
      toast.success('Account created! Check your email for a verification code.');
      navigate('/verify-email', { state: { email: result.email } });
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start managing your business in minutes — free for 14 days.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className="badge badge-danger" style={{ display: 'flex', marginBottom: 16, padding: '10px 14px', width: '100%' }}>
            <FiAlertCircle size={14} /> {serverError}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="name">Full name</label>
          <input id="name" className="form-input" placeholder="Damilola Ogundipe"
            {...register('name', { required: 'Full name is required' })} />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="business">Business name</label>
          <input id="business" className="form-input" placeholder="Ogundipe General Stores"
            {...register('business', { required: 'Business name is required' })} />
          {errors.business && <p className="form-error">{errors.business.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="form-input" placeholder="you@business.com"
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
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

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
          <PasswordInput
            register={register}
            name="confirmPassword"
            placeholder="Re-enter your password"
            rules={{ required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' }}
          />
          {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
          Create account
        </Button>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
