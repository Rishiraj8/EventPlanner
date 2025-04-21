import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import EventForm from './pages/EventForm';
import EventDetail from './pages/EventDetail';
import InviteDetail from './pages/InviteDetail';
import EventDetails from './pages/EventDetails';
import EditEvent from './pages/EditEvent'; 
import BookTicket from './pages/BookTicket';

function App() {
  const token = useSelector((state) => state.auth.token);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/create-event" element={token ? <EventForm /> : <Navigate to="/login" />} />
          <Route path="/events/:id" element={token ? <EventDetail /> : <Navigate to="/login" />} />
          <Route path="/edit-event/:id" element={token ? <EditEvent /> : <Navigate to="/login" />} />
          <Route path="/invite-detail/:id" element={token ? <InviteDetail /> : <Navigate to="/login" />} />
          <Route path="/guest/events/:eventId" element={token ? <EventDetails /> : <Navigate to="/login" />} />
          <Route path="/events/:eventId/book/:ticketId" element={token ? <BookTicket /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
