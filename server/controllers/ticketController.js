import Ticket from '../models/Ticket.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const listTickets = asyncHandler(async (req, res) => {
  const { search = '', priority = 'All', status = 'All' } = req.query;
  const filter = {};
  if (priority !== 'All') filter.priority = priority;
  if (status !== 'All') filter.status = status;

  const tickets = await Ticket.find(filter).populate('business', 'name').sort({ updatedAt: -1 });
  let data = tickets.map((t) => ({ ...t.toObject(), business: t.business?.name || 'Unknown', businessId: t.business?._id?.toString() || null }));
  if (search) {
    const q = search.toLowerCase();
    data = data.filter((t) => t.subject.toLowerCase().includes(q) || t.business.toLowerCase().includes(q));
  }
  res.json({ success: true, data });
});

export const assignTicket = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, { assignedTo, status: 'In Progress' }, { new: true });
  if (!ticket) throw ApiError.notFound('Ticket not found');
  res.json({ success: true, data: ticket });
});

export const resolveTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'Resolved' }, { new: true });
  if (!ticket) throw ApiError.notFound('Ticket not found');
  res.json({ success: true, data: ticket });
});

export const closeTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'Closed' }, { new: true });
  if (!ticket) throw ApiError.notFound('Ticket not found');
  res.json({ success: true, data: ticket });
});

export const addTicketComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) throw ApiError.badRequest('Comment text is required');
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw ApiError.notFound('Ticket not found');
  ticket.comments.push({ author: req.admin.name, text: text.trim(), internal: false });
  await ticket.save();
  res.json({ success: true, data: ticket });
});
