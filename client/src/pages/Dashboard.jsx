import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { logout, login } from '../redux/slices/authSlice';

export default function Dashboard() {
  const { user, role } = useSelector((state) => state.auth); // Get role from Redux state
  const [myEvents, setMyEvents] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check for token in localStorage and fetch user details on refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user && token) {
      API.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          dispatch(login({ user: res.data.user, token, role: res.data.role }));
        })
        .catch(() => {
          dispatch(logout());
          navigate('/login');
        });
    }
  }, [user, dispatch, navigate]);

  useEffect(() => {
    if (!user || !role) return;

    setLoading(true);
    if (role === 'host') {
      API.get('/events')
        .then((res) => {
          const createdByMe = res.data.filter((e) => e.host._id === user._id);
          setMyEvents(createdByMe);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else if (role === 'guest') {
      API.get('/rsvp/me')
        .then((res) => {
          setInvites(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user, role]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user || !role) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">EventPulse</h1>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Welcome Banner */}
          <div className="mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    Welcome back, {user?.name}! 🎉
                  </h2>
                  <p className="mt-1 text-sm text-indigo-100">
                    {role === 'host'
                      ? 'Manage your events and create new exciting experiences.'
                      : 'Check your invitations and RSVP to upcoming events.'}
                  </p>
                </div>
                {role === 'host' && (
                  <div className="mt-4 md:mt-0">
                    <button
                      onClick={() => navigate('/create-event')}
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-indigo-600"
                    >
                      <svg
                        className="mr-1.5 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                      Create New Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content based on role */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {role === 'host' && (
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                  <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Your Events</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      A list of all events you've created.
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {myEvents.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {myEvents.map((event) => (
                          <li key={event._id} className="py-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 rounded-md bg-indigo-100 p-2">
                                <svg
                                  className="h-6 w-6 text-indigo-600"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                                  <div className="mt-1 flex items-center text-sm text-gray-500">
                                    <svg
                                      className="mr-1.5 h-5 w-5 text-gray-400"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>
                                      {event.date?.slice(0, 10)} at {event.time}
                                    </span>
                                  </div>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                                <div className="mt-2">
                                  <button
                                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    onClick={() => navigate(`/events/${event._id}`)}
                                  >
                                    View Details
                                    <svg
                                      className="ml-1 h-4 w-4"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating a new event.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => navigate('/create-event')}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <svg
                              className="mr-1.5 h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            Create your first event
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {role === 'guest' && (
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                  <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Your Invites</h3>
                    <p className="mt-1 text-sm text-gray-500">Events you've been invited to.</p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {invites.length > 0 ? (
                      <ul className="grid gap-6 md:grid-cols-2">
                        {invites.map((invite) => (
                          <li
                            key={invite._id}
                            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow"
                          >
                            <div className="flex flex-col flex-1 p-6">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <svg
                                    className="h-6 w-6 text-indigo-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <h3 className="truncate text-lg font-medium text-gray-900">
                                  {invite.eventId.title}
                                </h3>
                              </div>
                              <div className="mt-2 flex-grow">
                                <p className="text-sm text-gray-500">{invite.eventId.description}</p>
                              </div>
                              <div className="mt-4">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                  ${
                                    invite.status === 'accepted'
                                      ? 'bg-green-100 text-green-800'
                                      : invite.status === 'declined'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="flex divide-x divide-gray-200">
                              <div className="flex w-0 flex-1">
                                <button
                                  onClick={() => navigate(`/guest/events/${invite.eventId._id}`)}
                                  className="relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No invites</h3>
                        <p className="mt-1 text-sm text-gray-500">You don't have any invitations yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}