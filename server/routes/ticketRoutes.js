import express from 'express';
import {
  createTicket,
  bookTicket,
  getEventTickets
} from '../controllers/ticketController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createTicket);
router.post('/book', protect, bookTicket);
router.get('/event/:eventId', getEventTickets);

export default router;
