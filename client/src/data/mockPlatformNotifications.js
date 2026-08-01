export const mockPlatformNotifications = [
  { id: 'pn1', type: 'security', title: 'Multiple failed login attempts', message: 'Detected 5 failed login attempts for Kano Traders Ltd.', read: false, time: new Date(Date.now() - 1200000).toISOString() },
  { id: 'pn2', type: 'payment', title: 'Payment failed', message: 'Subscription renewal failed for Benin Furniture Mart.', read: false, time: new Date(Date.now() - 3600000).toISOString() },
  { id: 'pn3', type: 'business', title: 'New business signed up', message: 'Ilorin Shoe Palace just created an account on the Growth plan.', read: false, time: new Date(Date.now() - 7200000).toISOString() },
  { id: 'pn4', type: 'system', title: 'Scheduled maintenance', message: 'Platform maintenance is scheduled for Sunday, 2AM WAT.', read: true, time: new Date(Date.now() - 14400000).toISOString() },
  { id: 'pn5', type: 'business', title: 'Business suspended', message: 'Sokoto Provisions was auto-suspended due to expired subscription.', read: true, time: new Date(Date.now() - 28800000).toISOString() },
  { id: 'pn6', type: 'payment', title: 'Large payment received', message: 'Abuja Tech Solutions upgraded to Enterprise — ₦45,000 received.', read: true, time: new Date(Date.now() - 86400000).toISOString() },
  { id: 'pn7', type: 'system', title: 'Platform update deployed', message: 'Version 2.4.0 deployed successfully with no downtime.', read: true, time: new Date(Date.now() - 172800000).toISOString() },
];

export const platformNotificationTone = {
  security: 'danger',
  payment: 'success',
  business: 'info',
  system: 'warning',
};
