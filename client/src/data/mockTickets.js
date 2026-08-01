import { mockBusinesses } from './mockBusinesses';

const subjects = [
  'Unable to print receipt', 'Payment not reflecting after upgrade', 'Cannot add new staff member',
  'Inventory count showing wrong figures', 'Login issues after password reset', 'Need help exporting reports',
  'Barcode scanner not connecting', 'Requesting refund for duplicate charge', 'Dashboard charts not loading',
  'How do I add a second branch?', 'Customer debt not updating', 'App running slow on mobile',
];

const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
const agents = ['Kemi Adisa (Support)', 'David Okoro (Support)', 'Unassigned'];

export const mockTickets = subjects.map((subject, i) => {
  const biz = mockBusinesses[i % mockBusinesses.length];
  return {
    id: `TCK-${9000 + i}`,
    subject,
    business: biz.name,
    businessId: biz.id,
    requester: biz.owner,
    priority: priorities[i % priorities.length],
    status: statuses[i % statuses.length],
    assignedTo: agents[i % agents.length],
    createdAt: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - i * 3600000 * 4).toISOString(),
    comments: [
      { author: biz.owner, text: 'This started happening after the last update. Please help.', time: new Date(Date.now() - i * 86400000 * 1.5).toISOString(), internal: false },
      ...(i % 3 === 0 ? [{ author: 'Kemi Adisa (Support)', text: 'Looking into this now, will update shortly.', time: new Date(Date.now() - i * 86400000 * 1.2).toISOString(), internal: false }] : []),
    ],
  };
});

export const ticketPriorities = priorities;
export const ticketStatuses = statuses;
export const supportAgents = agents;
