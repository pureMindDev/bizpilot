// Nigerian local format (0701...) needs the leading 0 dropped and the
// country code prepended for a wa.me link to work.
const WHATSAPP_NUMBER = '2347017470501';

/**
 * Builds a wa.me link with a prefilled message asking to upgrade to a given
 * plan. Used everywhere a paid-plan upgrade is requested (Plan & Billing tab,
 * the plan-limit modal, the sidebar upsell) — upgrades are handled manually
 * over WhatsApp rather than a self-serve checkout.
 */
export const getUpgradeWhatsAppLink = ({ businessName, planName, price }) => {
  const priceText = typeof price === 'number' ? ` (₦${price.toLocaleString()}/month)` : '';
  const bizText = businessName ? ` for ${businessName}` : '';
  const message = `Hi, I'd like to upgrade my BizPilot plan to ${planName}${priceText}${bizText}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export default getUpgradeWhatsAppLink;
