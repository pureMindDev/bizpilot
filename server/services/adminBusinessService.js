import Staff from '../models/Staff.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

/**
 * Enriches a Business document with live counts that aren't stored on the
 * Business record itself (user count, product count, total sales volume).
 */
export const enrichBusiness = async (business) => {
  const [users, products, salesAgg] = await Promise.all([
    Staff.countDocuments({ business: business._id }),
    Product.countDocuments({ business: business._id }),
    Sale.aggregate([{ $match: { business: business._id } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
  ]);

  return { ...business.toObject(), users, products, totalSales: salesAgg[0]?.total || 0 };
};

export const enrichBusinesses = (businesses) => Promise.all(businesses.map(enrichBusiness));

export default { enrichBusiness, enrichBusinesses };
