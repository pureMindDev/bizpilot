import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate, buildMeta } from '../utils/paginate.js';
import { assertWithinPlanLimit } from '../services/planLimitService.js';

// GET /api/products
export const listProducts = asyncHandler(async (req, res) => {
  const { search = '', category = 'All', lowStock } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = { business: req.businessId };
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
  if (category !== 'All') filter.category = category;
  if (lowStock === 'true') filter.$expr = { $lte: ['$stock', '$reorderLevel'] };

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ total, page, limit }) });
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, business: req.businessId });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  await assertWithinPlanLimit(req.businessId, 'products');
  const product = await Product.create({ ...req.body, business: req.businessId });
  res.status(201).json({ success: true, data: product });
});

// PATCH /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate({ _id: req.params.id, business: req.businessId }, req.body, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, business: req.businessId });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, message: 'Product deleted' });
});

// PATCH /api/products/:id/stock — relative stock adjustment, e.g. { delta: -3 }
export const adjustStock = asyncHandler(async (req, res) => {
  const { delta } = req.body;
  if (typeof delta !== 'number') throw ApiError.badRequest('delta must be a number');
  const product = await Product.findOne({ _id: req.params.id, business: req.businessId });
  if (!product) throw ApiError.notFound('Product not found');
  product.stock = Math.max(0, product.stock + delta);
  await product.save();
  res.json({ success: true, data: product });
});
