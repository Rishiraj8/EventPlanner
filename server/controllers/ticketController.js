import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';

export const createTicket = async (req, res) => {
  const { eventId, type, price, totalSeats } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.host.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    const ticket = await Ticket.create({
      event: eventId,
      type,
      price,
      totalSeats
    });

    event.tickets.push(ticket._id);
    await event.save();

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const bookTicket = async (req, res) => {
  const { ticketId } = req.body;

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.bookedSeats >= ticket.totalSeats)
      return res.status(400).json({ message: 'No seats available' });

    if (ticket.attendees.includes(req.user.id))
      return res.status(400).json({ message: 'Already booked' });

    ticket.attendees.push(req.user.id);
    ticket.bookedSeats += 1;
    await ticket.save();

    res.status(200).json({ message: 'Ticket booked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEventTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId });
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
