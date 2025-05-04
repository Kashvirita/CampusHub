import VerifyOtpAfterLogin from './pages/VerifyOtpAfterLogin';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Admin from './pages/Admin';
import Register from './pages/Register';
import Verify from './pages/Verify';
import AdminDashboard from './pages/AdminDashboard';
import CreateEventPage from './pages/CreateEvents';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import EventList from './pages/EventList';
import AdminEventDetails from './pages/AdminEventDetails';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<EventList />} />
      <Route path="/events/upcoming" element={<EventList />} />
      <Route path="/events/calendar" element={<CalendarPage />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/register" element={<Register />} />
      <Route path="/admin/verify-otp" element={<Verify />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/login/verify-otp" element={<VerifyOtpAfterLogin />} />
      <Route path="/admin/dashboard/:committeeId"
      element={
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>}/>
      <Route path="/admin/create-event/:committeeID" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
      <Route path="/admin/event/:id" element={<ProtectedRoute><AdminEventDetails /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
