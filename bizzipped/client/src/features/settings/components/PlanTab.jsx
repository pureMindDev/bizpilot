import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { FiCheck, FiMessageCircle, FiPackage } from 'react-icons/fi';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { extractErrorMessage } from '../../../utils/apiError';
import { getUpgradeWhatsAppLink } from '../../../utils/whatsapp';
import { mockPlans } from '../../../data/mockPlans';
import styles from './PlanTab.module.scss';

export default function PlanTab() {
  const { user } = useAuth();
  const { settings, refetch } = useSettings();
  const [searchParams] = useSearchParams();
  const suggestedPlan = searchParams.get('suggest');
  const [switching, setSwitching] = useState(false);
  const isOwner = user?.role === 'Owner';

  const currentPlan = settings.plan || 'Free';
  const renewalDate = settings.renewalDate ? new Date(settings.renewalDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  // Only the Free plan switches itself, instantly, with no payment involved.
  // Every paid plan is handled manually over WhatsApp (see handleUpgradeClick).
  const switchToFree = async () => {
    setSwitching(true);
    try {
      await api.post('/subscription/checkout', { plan: 'Free' });
      await refetch();
      toast.success("You're now on the Free plan.");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div>
      <div className={styles.sectionHead}>
        <span className={styles.sectionIcon}><FiPackage size={17} /></span>
        <div>
          <h3 className={styles.sectionHeading}>Plan & billing</h3>
          <p className={styles.sectionSub}>
            You're on the <strong>{currentPlan}</strong> plan
            {settings.subscriptionStatus ? ` — ${settings.subscriptionStatus}` : ''}
            {renewalDate ? `. Renews ${renewalDate}.` : '.'}
          </p>
        </div>
      </div>

      {!isOwner && (
        <div className={styles.ownerNotice}>Only the business owner can change the plan.</div>
      )}

      <div className={styles.grid}>
        {mockPlans.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          const isSuggested = !isCurrent && plan.name === suggestedPlan;
          const isFree = plan.price === 0;
          return (
            <div key={plan.id} className={`${styles.card} ${isCurrent ? styles.cardCurrent : ''} ${isSuggested ? styles.cardSuggested : ''}`}>
              {isCurrent && <span className={styles.badge}>Current plan</span>}
              {isSuggested && <span className={`${styles.badge} ${styles.badgeSuggested}`}>Suggested upgrade</span>}
              <h4>{plan.name}</h4>
              <div className={styles.price}>
                <span className={styles.currency}>₦</span>{plan.price.toLocaleString()}
                <span className={styles.interval}>/{plan.interval}</span>
              </div>
              <p className={styles.limits}>Up to {plan.userLimit} user{plan.userLimit === 1 ? '' : 's'} · {plan.productLimit.toLocaleString()} products</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}><FiCheck size={13} /> {f}</li>
                ))}
              </ul>
              {isFree ? (
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={isCurrent || !isOwner || switching}
                  onClick={switchToFree}
                >
                  {isCurrent ? 'Current plan' : switching ? 'Please wait…' : 'Switch to Free'}
                </button>
              ) : (
                <a
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', pointerEvents: isCurrent || !isOwner ? 'none' : 'auto', opacity: isCurrent || !isOwner ? 0.5 : 1 }}
                  href={getUpgradeWhatsAppLink({ businessName: settings.businessName, planName: plan.name, price: plan.price })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isCurrent ? 'Current plan' : <>Upgrade <FiMessageCircle size={14} /></>}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <p className={styles.fineprint}>
        Upgrading to a paid plan is handled directly over WhatsApp — tap the button above and we'll get you set up.
      </p>
    </div>
  );
}
