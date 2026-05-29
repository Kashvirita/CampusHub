import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
const API = import.meta.env.VITE_API_BASE_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/login', { state: { from: '/my-events' } });
      return;
    }

    const fetchMyEvents = async () => {
      try {
        const res = await axios.get(`${API}/api/students/my-events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load your events.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, [navigate]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter((e) => e.date && e.date.split('T')[0] >= today);
  const past = events.filter((e) => e.date && e.date.split('T')[0] < today).reverse();

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
          <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">Your hub</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">My events</h1>
          <p className="text-sm text-slate-500 mt-2">
            Everything you've RSVP'd to, all in one place.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-80" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : events.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 mb-2">You haven't registered for any events yet.</p>
            <Link to="/events/upcoming" className="text-[#2E5AA7] font-medium hover:underline text-sm">
              Browse events →
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">
                Upcoming <span className="text-slate-400 font-normal">· {upcoming.length}</span>
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming registrations.</p>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={stagger}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {upcoming.map((event) => (
                    <motion.div key={event._id} variants={fadeUp}>
                      <EventCard
                        id={event._id}
                        title={event.title}
                        description={event.shortDescription}
                        date={event.date}
                        startTime={event.startTime}
                        endTime={event.endTime}
                        imageUrl={event.imageUrl}
                        location={event.location}
                        committee={event.committeeName}
                        category={event.category}
                        capacity={event.capacity}
                        attendeeCount={event.attendeeCount ?? 0}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>

            {past.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-5">
                  Past <span className="text-slate-400 font-normal">· {past.length}</span>
                </h2>
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={stagger}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80"
                >
                  {past.map((event) => (
                    <motion.div key={event._id} variants={fadeUp}>
                      <EventCard
                        id={event._id}
                        title={event.title}
                        description={event.shortDescription}
                        date={event.date}
                        startTime={event.startTime}
                        endTime={event.endTime}
                        imageUrl={event.imageUrl}
                        location={event.location}
                        committee={event.committeeName}
                        category={event.category}
                        capacity={event.capacity}
                        attendeeCount={event.attendeeCount ?? 0}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default MyEvents;
