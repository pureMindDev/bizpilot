// getBusinessGrowth, getRevenueGrowth, and getMonthlySignups used to fabricate
// random historical numbers client-side. Real data for all three now comes
// from dedicated backend aggregation endpoints instead (see AdminDashboard.jsx,
// Analytics.jsx, and Payments.jsx). getPlanDistribution stays here since it's
// a cheap, accurate client-side aggregation of businesses that are already
// fully loaded — no extra request needed.

export function getPlanDistribution(businesses) {
  const totals = {};
  businesses.forEach((b) => { totals[b.plan] = (totals[b.plan] || 0) + 1; });
  return Object.entries(totals).map(([name, value]) => ({ name, value }));
}
