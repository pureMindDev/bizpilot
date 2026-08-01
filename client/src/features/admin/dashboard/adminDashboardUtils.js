export function getBusinessGrowth(businesses) {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  let running = Math.max(4, businesses.length - 14);
  return months.map((month, i) => {
    running += Math.floor(Math.random() * 4) + 1;
    return { month, businesses: i === months.length - 1 ? businesses.length : running };
  });
}

export function getRevenueGrowth(payments) {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const totalPaid = payments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  return months.map((month, i) => ({
    month,
    revenue: i === months.length - 1 ? totalPaid : Math.floor(totalPaid * (0.55 + i * 0.09)),
  }));
}

export function getPlanDistribution(businesses) {
  const totals = {};
  businesses.forEach((b) => { totals[b.plan] = (totals[b.plan] || 0) + 1; });
  return Object.entries(totals).map(([name, value]) => ({ name, value }));
}

export function getMonthlySignups() {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  return months.map((month, i) => ({ month, signups: Math.floor(Math.random() * 5) + (i === months.length - 1 ? 3 : 1) }));
}
