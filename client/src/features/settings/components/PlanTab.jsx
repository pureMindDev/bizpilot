import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiExternalLink } from 'react-icons/fi';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { extractErrorMessage } from '../../../utils/apiError';
import { mockPlans } from '../../../data/mockPlans';
import styles from './PlanTab.module.scss';

export default function PlanTab() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [checkingOut, setCheckingOut] = useState(null); // plan name currently starting checkout, or null
  const isOwner = user?.role === 'Owner';

  const currentPlan = settings.plan || 'Starter';
  const renewalDate = settings.renewalDate ? new Date(settings.renewalDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  const handleChoose = async (planName) => {
    if (planName === currentPlan) return;
    setCheckingOut(planName);
    try {
      const res = await api.post('/subscription/checkout', { plan: planName });
      // Full redirect, not a fetch — Paystack's checkout page is a real hosted
      // page the owner needs to land on and enter card details into.
      window.location.href = res.data.data.authorizationUrl;
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setCheckingOut(null);
    }
  };

  return (
    <div>
      <h3 className={styles.sectionHeading}>Plan & billing</h3>
      <p className={styles.sectionSub}>
        You're on the <strong>{currentPlan}</strong> plan
        {settings.subscriptionStatus ? ` — ${settings.subscriptionStatus}` : ''}
        {renewalDate ? `. Renews ${renewalDate}.` : '.'}
      </p>

      {!isOwner && (
        <div className={styles.ownerNotice}>Only the business owner can change the plan or make payments.</div>
      )}

      <div className={styles.grid}>
        {mockPlans.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          return (
            <div key={plan.id} className={`${styles.card} ${isCurrent ? styles.cardCurrent : ''}`}>
              {isCurrent && <span className={styles.badge}>Current plan</span>}
              <h4>{plan.name}</h4>
              <div className={styles.price}>
                <span className={styles.currency}>₦</span>{plan.price.toLocaleString()}
                <span className={styles.interval}>/{plan.interval}</span>
              </div>
              <p className={styles.limits}>Up to {plan.userLimit} users · {plan.productLimit.toLocaleString()} products</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}><FiCheck size={13} /> {f}</li>
                ))}
              </ul>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isCurrent || !isOwner || checkingOut !== null}
                onClick={() => handleChoose(plan.name)}
              >
                {isCurrent ? 'Current plan' : checkingOut === plan.name ? 'Redirecting…' : (
                  <>Switch to {plan.name} <FiExternalLink size={14} /></>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className={styles.fineprint}>
        Payments are handled securely by Paystack. You'll be redirected to a Paystack checkout page to complete payment.
      </p>
    </div>
  );
}
