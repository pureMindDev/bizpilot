import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import api from '../../services/api';
import { extractErrorMessage } from '../../utils/apiError';
import styles from './BillingCallback.module.scss';

export default function BillingCallback() {
  const [searchParams] = useSearchParams();
  // Paystack appends both `reference` and `trxref` (same value) to the
  // callback URL — either works, prefer `reference` if both are present.
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [state, setState] = useState('loading'); // loading | success | failed | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) {
      setState('error');
      setMessage('No payment reference was provided.');
      return;
    }
    api.get(`/subscription/verify/${reference}`)
      .then((res) => {
        const { payment } = res.data.data;
        if (payment.status === 'Paid') {
          setState('success');
          setMessage(`You're now on the ${payment.plan} plan.`);
        } else {
          setState('failed');
          setMessage("This payment didn't complete. No changes were made to your plan.");
        }
      })
      .catch((err) => {
        setState('error');
        setMessage(extractErrorMessage(err));
      });
  }, [reference]);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {state === 'loading' && (
          <>
            <FiLoader size={32} className={`${styles.icon} spin`} />
            <h1>Confirming your payment…</h1>
            <p>This only takes a moment.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <FiCheckCircle size={32} className={`${styles.icon} ${styles.success}`} />
            <h1>Payment successful</h1>
            <p>{message}</p>
          </>
        )}
        {(state === 'failed' || state === 'error') && (
          <>
            <FiXCircle size={32} className={`${styles.icon} ${styles.failed}`} />
            <h1>{state === 'failed' ? 'Payment not completed' : 'Something went wrong'}</h1>
            <p>{message}</p>
          </>
        )}
        {state !== 'loading' && (
          <Link to="/settings" className="btn btn-primary" style={{ marginTop: 20 }}>
            Back to settings
          </Link>
        )}
      </div>
    </div>
  );
}
