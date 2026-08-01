import { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiMail } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyEmail() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [serverError, setServerError] = useState('');
  const inputsRef = useRef([]);
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setLoading(true);
    try {
      await verifyEmail({ email, code: digits.join('') });
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const message = await resendVerification(email);
      toast.success(message || 'Verification code resent!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  // If someone lands here directly (no email in state — e.g. a page refresh),
  // there's no account context to verify against, so send them back to register.
  if (!email) {
    return (
      <AuthLayout title="Verification link expired">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          We couldn't find an account to verify. Please register again or log in if you already have an account.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Back to sign up
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verify your email">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
        <FiMail size={18} />
        <span>We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.</span>
      </div>
      <form onSubmit={onSubmit}>
        {serverError && (
          <div className="badge badge-danger" style={{ display: 'flex', marginBottom: 16, padding: '10px 14px', width: '100%' }}>
            <FiAlertCircle size={14} /> {serverError}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              className="form-input"
              style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '12px 0' }}
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>
        <Button type="submit" variant="primary" loading={loading} disabled={digits.join('').length !== 6} style={{ width: '100%', justifyContent: 'center' }}>
          Verify email
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
