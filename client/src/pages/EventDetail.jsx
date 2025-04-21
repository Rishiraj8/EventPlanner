import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [newTicket, setNewTicket] = useState({
    type: '',
    price: '',
    totalSeats: ''
  });
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [userToInvite, setUserToInvite] = useState('');
  const [users, setUsers] = useState([]);
  
  // New state for message insights
  const [insights, setInsights] = useState(null);
  const [analyzingMessages, setAnalyzingMessages] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch event details
        const eventRes = await API.get(`/events/${id}`);
        setEvent(eventRes.data);
        
        // Fetch tickets
        const ticketsRes = await API.get(`/tickets/event/${id}`);
        setTickets(ticketsRes.data);
        
        // Fetch RSVPs if user is host
        if (user && eventRes.data.host._id === user._id) {
          const rsvpsRes = await API.get(`/rsvp/event/${id}`);
          setRsvps(rsvpsRes.data);
          
          // Fetch existing insights if available
          try {
            const insightsRes = await API.get(`/messages/insights/${id}`);
            if (insightsRes.data && insightsRes.data.insights) {
              setInsights(insightsRes.data);
            }
          } catch (error) {
            console.log('No existing insights found');
          }
        }
        
        // Fetch messages
        const messagesRes = await API.get(`/messages/${id}`);
        setMessages(messagesRes.data);
        
        // Fetch users for invitation
        if (user && eventRes.data.host._id === user._id) {
          const usersRes = await API.get('/users');
          setUsers(usersRes.data.filter(u => u._id !== user._id));
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, user]);

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setNewTicket({
      ...newTicket,
      [name]: name === 'price' || name === 'totalSeats' ? Number(value) : value
    });
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/tickets/create', {
        ...newTicket,
        eventId: id
      });
      setTickets([...tickets, response.data]);
      setNewTicket({ type: '', price: '', totalSeats: '' });
      setShowTicketForm(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const bookTicket = async (ticketId) => {
    try {
      await API.post('/tickets/book', { ticketId });
      
      // Update the tickets list
      const updatedTickets = tickets.map(ticket => {
        if (ticket._id === ticketId) {
          return {
            ...ticket,
            bookedSeats: ticket.bookedSeats + 1,
            attendees: [...ticket.attendees, user._id]
          };
        }
        return ticket;
      });
      
      setTickets(updatedTickets);
      alert('Ticket booked successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book ticket');
    }
  };

  const inviteGuest = async () => {
    if (!userToInvite) return;
    
    try {
      await API.post('/rsvp/invite', {
        eventId: id,
        guestId: userToInvite
      });
      alert('Invitation sent successfully!');
      setUserToInvite('');
      
      // Refresh RSVPs
      const rsvpsRes = await API.get(`/rsvp/event/${id}`);
      setRsvps(rsvpsRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      const response = await API.post('/messages', {
        eventId: id,
        message
      });
      
      setMessages([...messages, response.data]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateEvent = async () => {
    navigate(`/edit-event/${id}`);
  };

  const deleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await API.delete(`/events/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };
  
  // New function to analyze messages
  const analyzeEventMessages = async () => {
    setAnalyzingMessages(true);
    try {
      const response = await API.post(`/messages/analyze/${id}`);
      setInsights(response.data);
      setShowInsights(true);
    } catch (error) {
      console.error('Error analyzing messages:', error);
      alert('Failed to analyze messages. Please try again.');
    } finally {
      setAnalyzingMessages(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Event not found</h1>
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

  const isHost = user && event.host._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Event Details</h1>
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
            <h3 className="text-2xl font-bold leading-6 text-white">{event.title}</h3>
            <p className="mt-1 text-sm text-indigo-100">Hosted by {event.host.name}</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.time}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.location}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.description}</dd>
              </div>
            </dl>
            
            {/* Host actions */}
            {isHost && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={updateEvent}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Event
                </button>
                <button
                  onClick={deleteEvent}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Tickets Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Tickets</h3>
                {isHost && (
                  <button
                    onClick={() => setShowTicketForm(!showTicketForm)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {showTicketForm ? 'Cancel' : 'Add Ticket'}
                  </button>
                )}
              </div>
              
              {/* Ticket form */}
              {showTicketForm && (
                <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                  <form onSubmit={createTicket}>
                    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-4">
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                          name="type"
                          id="type"
                          required
                          value={newTicket.type}
                          onChange={handleTicketChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="" disabled>Select Type</option>
                          <option value="Paid">Paid</option>
                          <option value="Free">Free</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                          type="number"
                          name="price"
                          id="price"
                          required
                          min="0"
                          value={newTicket.price}
                          onChange={handleTicketChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700">Total Seats</label>
                        <input
                          type="number"
                          name="totalSeats"
                          id="totalSeats"
                          required
                          min="1"
                          value={newTicket.totalSeats}
                          onChange={handleTicketChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Create Ticket
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Ticket list */}
              <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                {tickets.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <li key={ticket._id} className="py-4">
                        <div className="flex justify-between">
                          <div>
                          <h4 className="text-lg font-medium text-gray-900">{ticket.type}</h4>
                            <p className="text-sm text-gray-500">Price: ${ticket.price}</p>
                            <p className="text-sm text-gray-500">
                              Availability: {ticket.bookedSeats} / {ticket.totalSeats} booked
                            </p>
                          </div>
                          {user && user.role === 'guest' && !ticket.attendees.includes(user._id) && (
                            <button
                              onClick={() => bookTicket(ticket._id)}
                              disabled={ticket.bookedSeats >= ticket.totalSeats}
                              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white 
                                ${ticket.bookedSeats >= ticket.totalSeats ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                            >
                              Book Ticket
                            </button>
                          )}
                          {user && ticket.attendees.includes(user._id) && (
                            <span className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-green-800 bg-green-100">
                              Booked
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tickets available for this event yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Event Chat</h3>
                {isHost && (
                  <button
                    onClick={analyzeEventMessages}
                    disabled={analyzingMessages || messages.length === 0}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white 
                      ${analyzingMessages || messages.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                  >
                    {analyzingMessages ? 'Analyzing...' : 'Analyze Messages'}
                  </button>
                )}
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="h-64 overflow-y-auto mb-4">
                  {messages.length > 0 ? (
                    <ul className="space-y-4">
                      {messages.map((msg) => (
                        <li key={msg._id} className={`flex ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`inline-block px-4 py-2 rounded-lg ${msg.sender._id === user?._id ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
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
            
            {/* AI Insights Section - shown when available and requested */}
            {isHost && insights && showInsights && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600">
                  <h3 className="text-lg leading-6 font-medium text-white">Message Analysis</h3>
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-indigo-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                  >
                    Hide Analysis
                  </button>
                </div>
                
                <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                  {/* Summary */}
                  <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="text-md font-semibold text-indigo-900 mb-2">Summary</h4>
                    <p className="text-sm text-indigo-800">{insights.summary}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(insights.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Insights by Category */}
                  <div className="space-y-6">
                    {insights.insights.length > 0 ? (
                      insights.insights.map((insight, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <div className={`px-4 py-3 ${
                            insight.priority === 'high' ? 'bg-red-50 border-b border-red-100' :
                            insight.priority === 'medium' ? 'bg-yellow-50 border-b border-yellow-100' :
                            'bg-green-50 border-b border-green-100'
                          }`}>
                            <div className="flex items-center justify-between">
                              <h4 className="text-md font-medium">
                                {insight.title}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                                insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'}`}>
                                {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{insight.category}</p>
                          </div>
                          
                          <div className="px-4 py-3">
                            <p className="text-sm text-gray-800 mb-3">{insight.description}</p>
                            
                            {insight.details && insight.details.length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Examples from conversation:</h5>
                                <ul className="space-y-2">
                                  {insight.details.map((detail, idx) => (
                                    <li key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                      <span className="font-medium">{detail.from}: </span>
                                      {detail.text}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No specific insights were identified.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Sidebar */}
          <div className="lg:col-span-1">
            {isHost ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Guest Management</h3>
                </div>
                
                {/* Invite form */}
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="mb-4">
                    <label htmlFor="userToInvite" className="block text-sm font-medium text-gray-700">Invite Guest</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <select
                        id="userToInvite"
                        value={userToInvite}
                        onChange={(e) => setUserToInvite(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select a user</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={inviteGuest}
                        disabled={!userToInvite}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* RSVPs list */}
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">RSVPs</h4>
                  {rsvps.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {rsvps.map((rsvp) => (
                        <li key={rsvp._id} className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{rsvp.guestId.name}</p>
                              <p className="text-xs text-gray-500">{rsvp.guestId.email}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${rsvp.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                              rsvp.status === 'declined' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}
                            >
                              {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No RSVPs yet.</p>
                  )}
                </div>
                
                {/* Message Analysis Button and Summary - when insights available but not shown in main content */}
                {insights && !showInsights && (
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Message Insights</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      You have analyzed {messages.length} messages from your event chat.
                    </p>
                    <button
                      onClick={() => setShowInsights(true)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Analysis
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Event Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <p className="text-sm text-gray-500">
                    Join the event chat to communicate with the host and other guests.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Book a ticket to secure your spot at this event.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}