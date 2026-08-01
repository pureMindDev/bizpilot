import Customer from '../models/Customer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate, buildMeta } from '../utils/paginate.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const { search = '', debtOnly } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = { business: req.businessId };
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (debtOnly === 'true') filter.outstandingDebt = { $gt: 0 };

  const [items, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ total, page, limit }) });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, business: req.businessId });
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({ success: true, data: customer });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({ ...req.body, business: req.businessId });
  res.status(201).json({ success: true, data: customer });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate({ _id: req.params.id, business: req.businessId }, req.body, { new: true, runValidators: true });
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({ success: true, data: customer });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id, business: req.businessId });
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({ success: true, message: 'Customer deleted' });
});
