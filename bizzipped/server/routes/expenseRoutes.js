import { Router } from 'express';
import { body } from 'express-validator';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { protectBusiness } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(protectBusiness);

router.get('/', listExpenses);
router.post('/', [body('description').trim().notEmpty(), body('amount').isFloat({ min: 0 })], validate, createExpense);
router.patch('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
