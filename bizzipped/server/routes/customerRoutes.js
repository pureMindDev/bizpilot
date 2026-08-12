import { Router } from 'express';
import { body } from 'express-validator';
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { protectBusiness } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(protectBusiness);

router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.post('/', [body('name').trim().notEmpty(), body('phone').trim().notEmpty()], validate, createCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
