import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import Footer from '../components/Footer';
import intro_image from '../assets/images/intro_image.jpg';
const API = import.meta.env.VITE_API_BASE_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const eventsRef = useRef(null);
  const aboutRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API}/api/events/upcoming/all`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        const today = new Date().toISOString().split('T')[0];
        setUpcomingEvents((data || []).filter((e) => e.date >= today));
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (location.hash === '#events') eventsRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (location.hash === '#about') aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [location]);

  const scrollToEvents = () => eventsRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#06C5FF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFA628]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 mb-6">
                <span className="w-1.5 h-1.5 bg-[#FFA628] rounded-full animate-pulse" />
                Your campus, one hub
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.05] mb-6"
              >
                Every campus event,{' '}
                <span className="text-[#2E5AA7]">beautifully organised</span>.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-slate-600 leading-relaxed max-w-xl mb-8"
              >
                Discover what's on, register in seconds, and never miss a beat of student life.
                Built for committees, made for students.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <button
                  onClick={scrollToEvents}
                  className="bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-sm hover:shadow"
                >
                  Browse Events
                </button>
                <button
                  onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  How it works
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-12 flex items-center gap-8 text-sm">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{upcomingEvents.length}+</p>
                  <p className="text-slate-500 text-xs mt-0.5">Upcoming events</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-2xl font-semibold text-slate-900">All</p>
                  <p className="text-slate-500 text-xs mt-0.5">Committees</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-2xl font-semibold text-slate-900">Free</p>
                  <p className="text-slate-500 text-xs mt-0.5">Always</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#2E5AA7]/10 border border-slate-200">
                <img src={intro_image} alt="Campus" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2E5AA7]/30 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFA628]/20 flex items-center justify-center">
                  <span className="text-[#FFA628] text-lg">✦</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">This week</p>
                  <p className="text-sm font-semibold text-slate-900">{upcomingEvents.length} new events</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section ref={eventsRef} className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">What's on</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Upcoming events
              </h2>
            </div>
            <a href="/events/upcoming" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#2E5AA7] hover:gap-2.5 transition-all">
              See all <span>→</span>
            </a>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-80" />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {upcomingEvents.slice(0, 6).map((event) => (
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
          ) : (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500">No upcoming events right now.</p>
              <p className="text-slate-400 text-sm mt-1">Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section ref={aboutRef} className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">How it works</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Built for student life
            </h2>
            <p className="text-slate-600 leading-relaxed">
              CampusHub brings every fest, workshop, talk, and meetup into one feed.
              Committees publish in seconds. Students never miss out.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { num: '01', title: 'Discover', body: 'Browse every event your committees are hosting, this week and beyond.' },
              { num: '02', title: 'Manage', body: 'Committees create, edit, and track events from one focused dashboard.' },
              { num: '03', title: 'Connect', body: 'See exactly what is happening any given day with the campus calendar.' },
            ].map((card) => (
              <motion.div
                key={card.num}
                variants={fadeUp}
                className="bg-white rounded-2xl border border-slate-200 p-8 hover:border-[#2E5AA7]/40 hover:shadow-md transition-all"
              >
                <span className="text-xs font-medium text-[#FFA628] tracking-wider">{card.num}</span>
                <h3 className="text-xl font-semibold text-slate-900 mt-2 mb-2">{card.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
