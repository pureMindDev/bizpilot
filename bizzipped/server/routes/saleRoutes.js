import { Router } from 'express';
import { body } from 'express-validator';
import { listSales, createSale } from '../controllers/saleController.js';
import { protectBusiness } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(protectBusiness);

router.get('/', listSales);
router.post('/', [body('items').isArray({ min: 1 }), body('paymentMethod').isIn(['Cash', 'Transfer', 'POS'])], validate, createSale);

export default router;
