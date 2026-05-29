import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Searchbar from './Searchbar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
const API = import.meta.env.VITE_API_BASE_URL;

function Navbar() {
  const adminToken = localStorage.getItem('authToken');
  const committeeId = localStorage.getItem('committeeId');
  const studentToken = localStorage.getItem('studentToken');
  const studentName = localStorage.getItem('studentName');

  const navigate = useNavigate();
  const location = useLocation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventsForDate, setEventsForDate] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const calendarRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API}/api/events/upcoming/all`);
        const processed = response.data.map((event) => ({
          ...event,
          date: new Date(event.date).toISOString(),
        }));
        setEvents(processed);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setShowCalendar(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDateSelect = () => {
    setShowEvents(true);
    const selectedDateUTC = new Date(
      Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    );
    const formatted = selectedDateUTC.toISOString().split('T')[0];
    setEventsForDate(events.filter((e) => e.date.split('T')[0] === formatted));
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const formatted = dateUTC.toISOString().split('T')[0];
    const hasEvents = events.some((e) => e.date.split('T')[0] === formatted);
    return hasEvents ? (
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFA628] rounded-full" />
    ) : null;
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentId');
    setShowUserMenu(false);
    navigate('/');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('committeeId');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`relative text-sm font-medium transition-colors ${
        isActive(to) ? 'text-[#2E5AA7]' : 'text-slate-600 hover:text-[#2E5AA7]'
      }`}
    >
      {label}
      {isActive(to) && (
        <motion.span
          layoutId="navIndicator"
          className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[#FFA628] rounded-full"
        />
      )}
    </Link>
  );

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#2E5AA7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-3 h-3 rounded-sm bg-[#FFA628]" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Campus<span className="text-[#2E5AA7]">Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLink('/', 'Home')}
          {navLink('/events/upcoming', 'Events')}
          {navLink('/events/calendar', 'Calendar')}
          {studentToken && navLink('/my-events', 'My Events')}
          {adminToken && committeeId && navLink(`/admin/dashboard/${committeeId}`, 'Dashboard')}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Searchbar />
          </div>

          <div className="relative" ref={calendarRef}>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#2E5AA7] transition-colors"
              title="View by date"
              onClick={() => {
                setShowCalendar(!showCalendar);
                setShowEvents(false);
              }}
            >
              <FaCalendarAlt className="text-sm" />
            </button>

            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 w-80"
                >
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileContent={tileContent}
                    className="border-0 w-full"
                  />
                  <button
                    onClick={handleDateSelect}
                    className="mt-3 w-full bg-[#2E5AA7] hover:bg-[#244a8c] text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Show Events
                  </button>
                  {showEvents && (
                    <div className="mt-4 max-h-64 overflow-y-auto">
                      <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                        {selectedDate.toLocaleDateString()}
                      </h3>
                      {eventsForDate.length > 0 ? (
                        <div className="space-y-2">
                          {eventsForDate.map((event) => (
                            <div
                              key={event._id}
                              onClick={() => {
                                navigate(`/event/${event._id}`);
                                setShowCalendar(false);
                              }}
                              className="p-3 rounded-lg border border-slate-200 hover:border-[#2E5AA7] hover:bg-slate-50 cursor-pointer transition"
                            >
                              <p className="text-sm font-medium text-slate-900">{event.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {event.startTime} – {event.endTime}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 py-4 text-center">No events on this date</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth area */}
          {adminToken ? (
            <button
              onClick={handleAdminLogout}
              className="text-sm font-medium text-slate-700 hover:text-[#2E5AA7] px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Logout
            </button>
          ) : studentToken ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <FaUserCircle className="text-[#2E5AA7] text-lg" />
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                  {studentName?.split(' ')[0] || 'You'}
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{studentName || 'Student'}</p>
                    </div>
                    <Link
                      to="/my-events"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      My events
                    </Link>
                    <button
                      onClick={handleStudentLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 hover:text-[#2E5AA7] px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors hidden sm:inline-block"
              >
                Sign in
              </Link>
              <Link
                to="/admin/register"
                className="text-sm font-medium bg-[#2E5AA7] hover:bg-[#244a8c] text-white px-4 py-2 rounded-lg transition-colors"
              >
                For Committees
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
