import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function EventDetails() {
  const { eventId } = useParams(); // Get eventId from the route
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responding, setResponding] = useState(false); // State for button loading
  const [responseStatus, setResponseStatus] = useState(null); // State for RSVP status

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventRes = await API.get(`/events/${eventId}`); // Fetch event details
        setEventDetails(eventRes.data);

        const messagesRes = await API.get(`/messages/${eventId}`); // Fetch messages
        setMessages(messagesRes.data);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await API.post('/messages', { eventId, message });
      setMessages([...messages, response.data]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleRespond = async (status) => {
    setResponding(true);
    try {
      const response = await API.post('/rsvp/respond', { eventId, status }); // Post RSVP response
      setResponseStatus(status); // Update the RSVP status
      alert(response.data.message); // Show success message
    } catch (err) {
      console.error('Error responding to RSVP:', err);
      alert(err.response?.data?.message || 'Failed to respond to RSVP');
    } finally {
      setResponding(false);
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{eventDetails.title}</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {/* Event Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 to-purple-600">
            <h3 className="text-2xl font-bold leading-6 text-white">{eventDetails.title}</h3>
            <p className="mt-1 text-sm text-indigo-100">Hosted by {eventDetails.host.name}</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(eventDetails.date).toLocaleDateString()}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{eventDetails.time}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{eventDetails.location}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{eventDetails.description}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* RSVP Response Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Invitation</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {responseStatus ? (
              <div className="text-center">
                <span
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                    responseStatus === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  You have {responseStatus === 'accepted' ? 'accepted' : 'declined'} this invitation.
                </span>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleRespond('accepted')}
                  disabled={responding}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {responding ? 'Responding...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleRespond('declined')}
                  disabled={responding}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {responding ? 'Responding...' : 'Decline'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Event Chat</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="h-64 overflow-y-auto mb-4">
              {messages.length > 0 ? (
                <ul className="space-y-4">
                  {messages.map((msg) => (
                    <li key={msg._id} className={`flex ${msg.sender._id === eventDetails.host._id ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`inline-block px-4 py-2 rounded-lg ${
                          msg.sender._id === eventDetails.host._id ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">{msg.sender.name}</div>
                        <div>{msg.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet.</p>
                </div>
              )}
            </div>
            <form onSubmit={sendMessage} className="mt-4">
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 