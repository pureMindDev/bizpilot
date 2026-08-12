export const mockNotifications = [
  { id: 'n1', type: 'stock', title: 'Low stock alert', message: 'Nivea Body Lotion 400ml has only 4 units left.', read: false, time: new Date(Date.now() - 1800000).toISOString() },
  { id: 'n2', type: 'sale', title: 'New sale recorded', message: 'A sale of ₦18,200 was completed by Precious Etim.', read: false, time: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n3', type: 'staff', title: 'Staff login', message: 'Rasheed Bello logged in from a new device.', read: false, time: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n4', type: 'customer', title: 'New customer registered', message: 'Blessing Nwosu was added to your customer list.', read: true, time: new Date(Date.now() - 14400000).toISOString() },
  { id: 'n5', type: 'payment', title: 'Payment received', message: 'Transfer of ₦42,000 received from Tunde Balogun.', read: true, time: new Date(Date.now() - 28800000).toISOString() },
  { id: 'n6', type: 'stock', title: 'Low stock alert', message: 'LED Bulb 12W (Pack of 4) is below reorder level.', read: true, time: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n7', type: 'sale', title: 'New sale recorded', message: 'A sale of ₦6,750 was completed by Kunle Fashola.', read: true, time: new Date(Date.now() - 100000000).toISOString() },
];

export const notificationIconType = {
  stock: 'warning',
  sale: 'success',
  staff: 'info',
  customer: 'info',
  payment: 'success',
};
