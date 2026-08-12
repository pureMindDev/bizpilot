import Plan from '../models/Plan.js';
import Product from '../models/Product.js';
import Staff from '../models/Staff.js';
import Business from '../models/Business.js';
import { ApiError } from '../utils/ApiError.js';

// Order matters — used to suggest the next tier up in the upgrade prompt.
const PLAN_ORDER = ['Free', 'Starter', 'Growth', 'Enterprise'];

const nextPlanAfter = (planName) => {
  const i = PLAN_ORDER.indexOf(planName);
  return i >= 0 && i < PLAN_ORDER.length - 1 ? PLAN_ORDER[i + 1] : null;
};

const RESOURCES = {
  products: { model: Product, limitField: 'productLimit', label: 'products' },
  staff: { model: Staff, limitField: 'userLimit', label: 'staff members' },
};

/**
 * Throws ApiError.limitReached (403, code PLAN_LIMIT_REACHED) if creating one
 * more of `resource` ('products' | 'staff') would put the business over its
 * plan's limit. Call this *before* creating the record.
 *
 * The thrown error's `details` carries everything the frontend needs to
 * render an upgrade prompt without a second round-trip: the limit that was
 * hit, the current plan, and the specific next plan to suggest.
 */
export const assertWithinPlanLimit = async (businessId, resourceKey) => {
  const resource = RESOURCES[resourceKey];
  if (!resource) throw new Error(`Unknown plan-limited resource: ${resourceKey}`);

  const business = await Business.findById(businessId).select('plan');
  if (!business) return; // let the caller's own not-found handling take over

  const plan = await Plan.findOne({ name: business.plan });
  if (!plan) return; // no matching Plan doc (shouldn't happen with seeded data) — fail open rather than block

  const limit = plan[resource.limitField];
  if (!Number.isFinite(limit)) return; // no cap on this plan

  const current = await resource.model.countDocuments({ business: businessId });
  if (current < limit) return; // still room

  const upgradeTo = nextPlanAfter(business.plan);

  throw ApiError.limitReached(
    upgradeTo
      ? `You've reached the ${resource.label} limit (${limit}) on the ${business.plan} plan. Upgrade to ${upgradeTo} to add more.`
      : `You've reached the ${resource.label} limit (${limit}) on the ${business.plan} plan.`,
    { resource: resourceKey, limit, current, plan: business.plan, upgradeTo }
  );
};

export default { assertWithinPlanLimit };
