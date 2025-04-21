import express from 'express';
import { 
  sendMessage, 
  getMessages, 
  analyzeMessages, 
  getInsights 
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/analyze/:eventId', protect, analyzeMessages);
router.post('/', protect, sendMessage);
router.get('/:eventId', protect, getMessages);

// router.get('/insights/:eventId', protect, getInsights);

export default router;