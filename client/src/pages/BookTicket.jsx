import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function BookTicket() {
  const { eventId, ticketId } = useParams(); // Get eventId and ticketId from the route
  const navigate = useNavigate();
  const [ticketDetails, setTicketDetails] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch event details
        const eventRes = await API.get(`/events/${eventId}`);
        setEventDetails(eventRes.data);

        // Fetch ticket details
        const ticketRes = await API.get(`/tickets/event/${eventId}`);
        const ticket = ticketRes.data.find((t) => t._id === ticketId);
        setTicketDetails(ticket);
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [eventId, ticketId]);

  const handleBookTicket = async () => {
    try {
      await API.post('/tickets/book', { ticketId });
      alert('Ticket booked successfully!');
      navigate(`/events/${eventId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Error: {error}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Book Ticket</h1>
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Back to Event
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 to-purple-600">
            <h3 className="text-2xl font-bold leading-6 text-white">{eventDetails.title}</h3>
            <p className="mt-1 text-sm text-indigo-100">Hosted by {eventDetails.host.name}</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Ticket Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{ticketDetails.type}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900 font-bold text-indigo-600">${ticketDetails.price}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Availability</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {ticketDetails.bookedSeats} / {ticketDetails.totalSeats} booked
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Event Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{eventDetails.description}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <button
                onClick={handleBookTicket}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}