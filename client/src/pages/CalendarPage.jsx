import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';
const API = import.meta.env.VITE_API_BASE_URL;

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventsForDate, setEventsForDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API}/api/events/upcoming/all`);
        setEvents(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setEventsForDate(events.filter((e) => e.date.split('T')[0] === formatted));
    }
  }, [selectedDate, events]);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const formatted = date.toISOString().split('T')[0];
    const hasEvents = events.some((e) => e.date.split('T')[0] === formatted);
    return hasEvents ? (
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFA628] rounded-full" />
    ) : null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">Plan ahead</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Event calendar</h1>
          <p className="text-sm text-slate-500 mt-2">Click any date to see what's happening</p>
        </motion.div>

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-slate-100 animate-pulse rounded-2xl h-96" />
            <div className="bg-slate-100 animate-pulse rounded-2xl h-96" />
          </div>
        ) : error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid lg:grid-cols-5 gap-8"
          >
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="border-0 w-full"
              />
            </div>

            <div className="lg:col-span-2 bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <span className="text-xs text-slate-500">{eventsForDate.length} events</span>
              </div>

              {eventsForDate.length > 0 ? (
                <div className="space-y-3">
                  {eventsForDate.map((event) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: 2 }}
                      onClick={() => navigate(`/event/${event._id}`)}
                      className="bg-white rounded-xl border border-slate-200 hover:border-[#2E5AA7]/40 p-4 cursor-pointer transition-all hover:shadow-sm"
                    >
                      <p className="font-medium text-slate-900 mb-1">{event.title}</p>
                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <FaClock className="text-[#2E5AA7] text-[10px]" />
                          {event.startTime} – {event.endTime}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-[#2E5AA7] text-[10px]" />
                          {event.location}
                        </div>
                      </div>
                      <span className="inline-block mt-2 text-[10px] font-medium text-[#2E5AA7] bg-[#2E5AA7]/10 px-2 py-0.5 rounded-full">
                        {event.committeeName}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-sm">No events on this date</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default CalendarPage;
