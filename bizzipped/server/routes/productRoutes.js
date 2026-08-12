import { Router } from 'express';
import { body } from 'express-validator';
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct, adjustStock,
} from '../controllers/productController.js';
import { protectBusiness } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(protectBusiness);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post(
  '/',
  [body('name').trim().notEmpty(), body('sku').trim().notEmpty(), body('costPrice').isFloat({ min: 0 }), body('sellingPrice').isFloat({ min: 0 })],
  validate,
  createProduct
);
router.patch('/:id', updateProduct);
router.patch('/:id/stock', adjustStock);
router.delete('/:id', deleteProduct);

export default router;
