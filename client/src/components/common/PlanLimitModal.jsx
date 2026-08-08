import { FiArrowUpCircle, FiMessageCircle } from 'react-icons/fi';
import Modal from './Modal';
import { useSettings } from '../../contexts/SettingsContext';
import { getUpgradeWhatsAppLink } from '../../utils/whatsapp';
import { mockPlans } from '../../data/mockPlans';
import styles from './PlanLimitModal.module.scss';

// details: { message, resource, limit, current, plan, upgradeTo } — the exact
// shape thrown by the backend's ApiError.limitReached (see
// server/services/planLimitService.js). Rendered wherever a create action
// (add product, add staff, ...) can hit a plan cap.
export default function PlanLimitModal({ details, onClose }) {
  const { settings } = useSettings();
  if (!details) return null;

  const targetPlanName = details.upgradeTo || 'a higher';
  const targetPlan = mockPlans.find((p) => p.name === details.upgradeTo);
  const whatsappLink = getUpgradeWhatsAppLink({
    businessName: settings.businessName,
    planName: targetPlanName,
    price: targetPlan?.price,
  });

  return (
    <Modal
      open={Boolean(details)}
      onClose={onClose}
      title="Plan limit reached"
      subtitle={`You're on the ${details.plan} plan`}
      width={420}
    >
      <div className={styles.body}>
        <FiArrowUpCircle size={32} className={styles.icon} />
        <p>{details.message}</p>
      </div>
      <div className={styles.actions}>
        <button className="btn btn-secondary" onClick={onClose}>Not now</button>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={onClose}>
          Upgrade <FiMessageCircle size={14} />
        </a>
      </div>
    </Modal>
  );
}
