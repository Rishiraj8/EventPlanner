import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js'; 
import { protect } from './middleware/authMiddleware.js'; 
import ticketRoutes from './routes/ticketRoutes.js';
import rsvpRoutes from './routes/rsvpRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js'; 

dotenv.config();
const app = express();

app.use(cors(
  {
    origin: "https://event-planner-seven-rose.vercel.app",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
));
app.use(express.json());

app.get('/', (req, res) => res.send('EventHub API Running'));
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/tickets', ticketRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/protected', protect);
app.use('/api/users', userRoutes);



const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch(err => console.error(err));
