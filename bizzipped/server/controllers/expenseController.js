import Expense from '../models/Expense.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const listExpenses = asyncHandler(async (req, res) => {
  const { category = 'All' } = req.query;
  const filter = { business: req.businessId };
  if (category !== 'All') filter.category = category;
  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json({ success: true, data: expenses });
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, business: req.businessId, recordedBy: req.staff.name });
  res.status(201).json({ success: true, data: expense });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate({ _id: req.params.id, business: req.businessId }, req.body, { new: true, runValidators: true });
  if (!expense) throw ApiError.notFound('Expense not found');
  res.json({ success: true, data: expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, business: req.businessId });
  if (!expense) throw ApiError.notFound('Expense not found');
  res.json({ success: true, message: 'Expense deleted' });
});
