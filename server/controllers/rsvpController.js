import Rsvp from '../models/Rsvp.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

// invitation (guest ku)
export const inviteGuest = async (req, res) => {
  const { eventId, guestId } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.host.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    const existingInvite = await Rsvp.findOne({ eventId, guestId });
    if (existingInvite) return res.status(400).json({ message: 'Already invited' });

    const rsvp = await Rsvp.create({ eventId, guestId });
    res.status(201).json(rsvp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// guest oda response
export const respondToInvite = async (req, res) => {
  const { eventId, status } = req.body;

  try {
    const rsvp = await Rsvp.findOne({ eventId, guestId: req.user.id });
    if (!rsvp) return res.status(404).json({ message: 'No invite found' });

    rsvp.status = status;
    await rsvp.save();

    res.status(200).json({ message: `RSVP ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// view all the rsvp's
export const getEventRsvps = async (req, res) => {
  try {
    const rsvps = await Rsvp.find({ eventId: req.params.eventId }).populate('guestId', 'name email');
    res.status(200).json(rsvps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// view the guest invites
export const getUserInvites = async (req, res) => {
  try {
    const rsvps = await Rsvp.find({ guestId: req.user.id }).populate('eventId');
    res.status(200).json(rsvps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
