import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminEventCard from '../components/AdminEventCard';
import { FaPlus } from 'react-icons/fa';
const API = import.meta.env.VITE_API_BASE_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const AdminDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [committeeId, setCommitteeId] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API}/api/admin/events/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const today = new Date().toISOString().split('T')[0];
      setUpcomingEvents(data.filter((e) => e.date >= today));
      setPastEvents(data.filter((e) => e.date < today).reverse());
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedCommitteeId = localStorage.getItem('committeeId');
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const id = decoded.committeeId || decoded.id || storedCommitteeId;
        if (id) {
          setCommitteeId(id);
          fetchEvents(id);
        } else navigate('/admin/login');
      } catch {
        if (storedCommitteeId) {
          setCommitteeId(storedCommitteeId);
          fetchEvents(storedCommitteeId);
        } else navigate('/admin/login');
      }
    } else if (storedCommitteeId) {
      setCommitteeId(storedCommitteeId);
      fetchEvents(storedCommitteeId);
    } else navigate('/admin/login');
  }, [navigate]);

  const list = tab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">Admin</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Your dashboard</h1>
            <p className="text-sm text-slate-500 mt-2">Create and manage events for your committee.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/admin/create-event/${committeeId}`)}
            className="inline-flex items-center gap-2 bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm hover:shadow"
          >
            <FaPlus className="text-xs" /> New event
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Upcoming', value: upcomingEvents.length, accent: 'text-[#2E5AA7]' },
            { label: 'Past', value: pastEvents.length, accent: 'text-slate-600' },
            { label: 'Total', value: upcomingEvents.length + pastEvents.length, accent: 'text-[#FFA628]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className={`text-3xl font-semibold mt-2 ${stat.accent}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-8">
          {['upcoming', 'past'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'text-[#2E5AA7]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t} events
              {tab === t && (
                <motion.span
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E5AA7]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-80" />
            ))}
          </div>
        ) : list.length > 0 ? (
          <motion.div
            key={tab}
            initial="hidden"
            animate="show"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {list.map((event) => (
              <motion.div key={event._id} variants={fadeUp}>
                <AdminEventCard
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
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 mb-1">No {tab} events</p>
            {tab === 'upcoming' && (
              <button
                onClick={() => navigate(`/admin/create-event/${committeeId}`)}
                className="mt-3 text-sm text-[#2E5AA7] font-medium hover:underline"
              >
                Create your first event →
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
