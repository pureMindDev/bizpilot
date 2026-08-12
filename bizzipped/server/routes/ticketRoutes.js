import { Router } from 'express';
import { body } from 'express-validator';
import { listTickets, assignTicket, resolveTicket, closeTicket, addTicketComment } from '../controllers/ticketController.js';
import { protectAdmin } from '../middlewares/adminAuth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(protectAdmin);

router.get('/', listTickets);
router.patch('/:id/assign', [body('assignedTo').notEmpty()], validate, assignTicket);
router.patch('/:id/resolve', resolveTicket);
router.patch('/:id/close', closeTicket);
router.post('/:id/comments', [body('text').notEmpty()], validate, addTicketComment);

export default router;
