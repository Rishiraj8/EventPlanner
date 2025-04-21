import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-event" element={<EventForm />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/invite-detail/:id" element={<InviteDetail />} />
          <Route path="/guest/events/:eventId" element={<EventDetails />} /> 
          {/* For guests */}
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/events/:eventId/book/:ticketId" element={<BookTicket />} />
          
         

          {/* Need to add routes*/ }
        </Routes>
      </div>
    </Router>
  );
}

export default App;
