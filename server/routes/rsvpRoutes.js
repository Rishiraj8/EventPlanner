import express from 'express';
import {
  inviteGuest,
  respondToInvite,
  getEventRsvps,
  getUserInvites
} from '../controllers/rsvpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/invite', protect, inviteGuest);
router.post('/respond', protect, respondToInvite);
router.get('/event/:eventId', protect, getEventRsvps);
router.get('/me', protect, getUserInvites);

export default router;
