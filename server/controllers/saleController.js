import Sale from '../models/Sale.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate, buildMeta } from '../utils/paginate.js';
import { completeCheckout } from '../services/saleService.js';

// GET /api/sales
export const listSales = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { business: req.businessId };

  const [items, total] = await Promise.all([
    Sale.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Sale.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ total, page, limit }) });
});

// POST /api/sales — completes a checkout via saleService
export const createSale = asyncHandler(async (req, res) => {
  const { items, paymentMethod, discount = 0, customer = 'Walk-in Customer' } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw ApiError.badRequest('At least one line item is required');
  if (!paymentMethod) throw ApiError.badRequest('paymentMethod is required');

  const sale = await completeCheckout({
    businessId: req.businessId,
    items,
    paymentMethod,
    discount,
    customer,
    cashierName: req.staff.name,
  });

  res.status(201).json({ success: true, data: sale });
});
