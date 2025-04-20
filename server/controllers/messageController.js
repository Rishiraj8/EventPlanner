import Message from '../models/Message.js';
import Event from '../models/Event.js';

// Send a message
export const sendMessage = async (req, res) => {
  const { eventId, message } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const newMessage = await Message.create({
      eventId,
      sender: req.user.id,
      message
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages for an event
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ eventId: req.params.eventId })
      .populate('sender', 'name email')
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
