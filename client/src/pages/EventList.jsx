import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFilter } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
const API = import.meta.env.VITE_API_BASE_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const CATEGORY_COLORS = {
  Workshop: 'border-violet-300 text-violet-700 bg-violet-50',
  Talk: 'border-blue-300 text-blue-700 bg-blue-50',
  Fest: 'border-pink-300 text-pink-700 bg-pink-50',
  Sports: 'border-emerald-300 text-emerald-700 bg-emerald-50',
  Cultural: 'border-amber-300 text-amber-700 bg-amber-50',
  Other: 'border-slate-300 text-slate-700 bg-slate-50',
};

function EventList() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ committees: [], categories: [] });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter state, hydrated from URL
  const [search, setSearch] = useState(params.get('search') || '');
  const [categories, setCategories] = useState(
    params.get('category') ? params.get('category').split(',').filter(Boolean) : []
  );
  const [committee, setCommittee] = useState(params.get('committee') || '');
  const [from, setFrom] = useState(params.get('from') || '');
  const [to, setTo] = useState(params.get('to') || '');

  // Fetch metadata once
  useEffect(() => {
    axios.get(`${API}/api/events/filters/meta`).then((res) => setMeta(res.data)).catch(() => {});
  }, []);

  // Sync state → URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    if (categories.length) next.set('category', categories.join(','));
    if (committee) next.set('committee', committee);
    if (from) next.set('from', from);
    if (to) next.set('to', to);
    navigate({ pathname: location.pathname, search: next.toString() }, { replace: true });
  }, [search, categories, committee, from, to, navigate, location.pathname]);

  // Fetch events whenever filters change
  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/events/upcoming/all`, {
          params: {
            search: search || undefined,
            category: categories.join(',') || undefined,
            committee: committee || undefined,
            from: from || undefined,
            to: to || undefined,
          },
        });
        if (!cancelled) {
          setEvents(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load events. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => { cancelled = true; };
  }, [search, categories, committee, from, to]);

  const toggleCategory = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearAll = () => {
    setSearch('');
    setCategories([]);
    setCommittee('');
    setFrom('');
    setTo('');
  };

  const activeCount = [
    search,
    categories.length > 0,
    committee,
    from,
    to,
  ].filter(Boolean).length;

  const FiltersPanel = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">Category</p>
        <div className="flex flex-wrap gap-2">
          {(meta.categories.length ? meta.categories : ['Workshop', 'Talk', 'Fest', 'Sports', 'Cultural', 'Other']).map((cat) => {
            const active = categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`text-xs font-medium border px-3 py-1.5 rounded-full transition-all ${
                  active
                    ? `${CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other} shadow-sm`
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Committee */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">Committee</p>
        <select
          value={committee}
          onChange={(e) => setCommittee(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
        >
          <option value="">All committees</option>
          {meta.committees.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">Date range</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            min={from || undefined}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
          />
        </div>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-sm text-[#2E5AA7] font-medium hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

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
          <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">
            {search ? 'Search results' : 'Browse'}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            {search ? (
              <>Results for <span className="text-[#2E5AA7]">"{search}"</span></>
            ) : (
              'Upcoming events'
            )}
          </h1>
          {!loading && !error && (
            <p className="text-sm text-slate-500 mt-2">
              {events.length} {events.length === 1 ? 'event' : 'events'}
              {activeCount > 0 && <span className="text-slate-400"> · {activeCount} filter{activeCount > 1 ? 's' : ''}</span>}
            </p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block bg-white sticky top-24 h-fit">
            {FiltersPanel}
          </aside>

          {/* Mobile filter trigger */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-slate-300"
            >
              <FiFilter /> Filters {activeCount > 0 && (
                <span className="bg-[#2E5AA7] text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeCount}</span>
              )}
            </button>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-sm text-slate-500 hover:text-[#2E5AA7]">Clear</button>
            )}
          </div>

          {/* Mobile slide-over */}
          <AnimatePresence>
            {showMobileFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="lg:hidden fixed inset-0 bg-slate-900/40 z-40"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.25 }}
                  className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 p-6 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)} className="text-slate-500 hover:text-slate-900">
                      <FiX size={20} />
                    </button>
                  </div>
                  {FiltersPanel}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Results */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-80" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16"><p className="text-red-600">{error}</p></div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 mb-1">
                  {activeCount > 0 ? 'No events match your filters' : 'No upcoming events right now'}
                </p>
                {activeCount > 0 ? (
                  <button onClick={clearAll} className="text-sm text-[#2E5AA7] font-medium hover:underline mt-2">
                    Clear filters →
                  </button>
                ) : (
                  <p className="text-slate-400 text-sm">Check back soon.</p>
                )}
              </div>
            ) : (
              <motion.div
                key={`${categories.join('-')}-${committee}-${from}-${to}-${search}`}
                initial="hidden"
                animate="show"
                variants={stagger}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {events.map((event) => (
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default EventList;
