import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaCheckCircle,
  FaShareAlt, FaWhatsapp, FaTwitter, FaEnvelope, FaLink, FaCheck,
  FaGoogle, FaDownload, FaCalendarPlus,
} from 'react-icons/fa';
import { downloadIcs, buildGoogleCalendarUrl } from '../utils/calendar';
const API = import.meta.env.VITE_API_BASE_URL;

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const shareRef = useRef(null);
  const calRef = useRef(null);

  const studentToken = localStorage.getItem('studentToken');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API}/api/events/event/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!studentToken || !id) return;
    axios
      .get(`${API}/api/students/rsvp/${id}/check`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      })
      .then((res) => setRegistered(res.data.registered))
      .catch(() => {});
  }, [id, studentToken]);

  useEffect(() => {
    const handler = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false);
      if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const refreshEvent = async () => {
    try {
      const res = await fetch(`${API}/api/events/event/${id}`);
      if (res.ok) setEvent(await res.json());
    } catch {}
  };

  const handleRsvp = async () => {
    if (!studentToken) {
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await axios.post(
        `${API}/api/students/rsvp/${id}`,
        {},
        { headers: { Authorization: `Bearer ${studentToken}` } }
      );
      setRegistered(true);
      setFeedback({ type: 'success', text: "You're registered. We'll send you a reminder." });
      await refreshEvent();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.msg || 'Could not register.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your registration?')) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await axios.delete(`${API}/api/students/rsvp/${id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      setRegistered(false);
      setFeedback({ type: 'success', text: 'Registration cancelled.' });
      await refreshEvent();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.msg || 'Could not cancel.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on CampusHub`,
          url: window.location.href,
        });
        setShareOpen(false);
        return true;
      } catch {}
    }
    return false;
  };

  const onShareClick = async () => {
    const usedNative = await handleNativeShare();
    if (!usedNative) setShareOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          <div className="bg-slate-100 animate-pulse rounded-2xl h-[400px]" />
          <div className="bg-slate-100 animate-pulse rounded-lg h-8 w-2/3 mt-8" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-slate-500 mb-4">Event not found</p>
            <Link to="/events/upcoming" className="text-[#2E5AA7] font-medium hover:underline">
              ← Back to events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge =
    event.status === 'upcoming'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : event.status === 'ongoing'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  const attendeeCount = event.attendeeCount ?? 0;
  const hasCapacity = event.capacity != null && event.capacity > 0;
  const spotsLeft = hasCapacity ? event.capacity - attendeeCount : null;
  const isFull = hasCapacity && spotsLeft <= 0;
  const isNearlyFull = hasCapacity && spotsLeft > 0 && spotsLeft <= Math.max(5, event.capacity * 0.1);
  const fillPercent = hasCapacity ? Math.min(100, Math.round((attendeeCount / event.capacity) * 100)) : 0;

  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out ${event.title} on CampusHub`);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#2E5AA7] mb-6 transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative rounded-3xl overflow-hidden bg-slate-100 mb-10"
        >
          <img
            src={event.imageUrl || '/default-event.jpg'}
            alt={event.title}
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Share button on hero */}
          <div className="absolute top-4 right-4" ref={shareRef}>
            <button
              onClick={onShareClick}
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur hover:bg-white text-slate-700 text-sm font-medium px-3.5 py-2 rounded-full shadow-sm transition-colors"
            >
              <FaShareAlt className="text-xs" /> Share
            </button>
            <AnimatePresence>
              {shareOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                >
                  <button
                    onClick={copyLink}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <FaCheck className="text-emerald-600" /> : <FaLink className="text-slate-500" />}
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShareOpen(false)}
                  >
                    <FaWhatsapp className="text-emerald-600" /> WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShareOpen(false)}
                  >
                    <FaTwitter className="text-sky-500" /> Twitter / X
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${shareText}%20${shareUrl}`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShareOpen(false)}
                  >
                    <FaEnvelope className="text-slate-500" /> Email
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-block text-xs font-medium border px-2.5 py-1 rounded-full capitalize ${statusBadge} backdrop-blur`}>
                {event.status}
              </span>
              {isFull && (
                <span className="inline-block text-xs font-medium bg-red-50 text-red-700 border border-red-200 backdrop-blur px-2.5 py-1 rounded-full">
                  Full
                </span>
              )}
              {isNearlyFull && !isFull && (
                <span className="inline-block text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 backdrop-blur px-2.5 py-1 rounded-full">
                  Only {spotsLeft} left
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <div className="md:col-span-2 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">About this event</p>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {event.eventDescription || event.shortDescription}
              </p>
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm px-3 py-2.5 rounded-lg border ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : 'bg-red-50 border-red-100 text-red-700'
                }`}
              >
                {feedback.text}
              </motion.div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {registered ? (
                <>
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-5 py-2.5 rounded-xl">
                    <FaCheckCircle /> You're registered
                  </div>
                  <button
                    onClick={handleCancel}
                    disabled={submitting}
                    className="bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Cancelling…' : 'Cancel registration'}
                  </button>
                </>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRsvp}
                  disabled={submitting || isFull}
                  className="bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isFull ? 'Event full' : submitting ? 'Registering…' : studentToken ? 'Register for this event' : 'Sign in to register'}
                </motion.button>
              )}
              <div className="relative" ref={calRef}>
                <button
                  onClick={() => setCalOpen((v) => !v)}
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  <FaCalendarPlus className="text-xs" /> Add to Calendar
                </button>
                <AnimatePresence>
                  {calOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                    >
                      <a
                        href={buildGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setCalOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FaGoogle className="text-red-500" /> Google Calendar
                      </a>
                      <button
                        onClick={() => {
                          downloadIcs(event);
                          setCalOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FaDownload className="text-slate-500" /> Download .ics
                      </button>
                      <p className="px-4 pt-2 text-[11px] text-slate-400 border-t border-slate-100 mt-1">
                        .ics works with Apple Calendar, Outlook, and most calendar apps.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => navigate('/events/upcoming')}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                See more events
              </button>
            </div>

            {/* Map embed */}
            {event.location && (
              <div className="pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-3">Where</p>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <iframe
                    title={`Map of ${event.location}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-72 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <FaMapMarkerAlt className="text-[#2E5AA7]" />
                      <span>{event.location}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#2E5AA7] hover:underline"
                    >
                      Open in Maps →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 h-fit">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Details</p>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-[#2E5AA7] mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">Date</p>
                  <p className="text-slate-900 font-medium">{new Date(event.date).toDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaClock className="text-[#2E5AA7] mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">Time</p>
                  <p className="text-slate-900 font-medium">{event.startTime} – {event.endTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-[#2E5AA7] mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">Location</p>
                  <p className="text-slate-900 font-medium">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaUsers className="text-[#2E5AA7] mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">Hosted by</p>
                  <p className="text-slate-900 font-medium">{event.committeeName}</p>
                </div>
              </div>
              {event.category && (
                <div className="flex items-start gap-3">
                  <span className="text-[#2E5AA7] mt-0.5 text-sm font-bold">#</span>
                  <div>
                    <p className="text-slate-500 text-xs">Category</p>
                    <p className="text-slate-900 font-medium">{event.category}</p>
                  </div>
                </div>
              )}

              {/* Capacity */}
              <div className="pt-3 border-t border-slate-200">
                {hasCapacity ? (
                  <>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <p className="text-slate-500 text-xs">Registrations</p>
                      <p className={`text-xs font-medium ${
                        isFull ? 'text-red-600' : isNearlyFull ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {isFull ? 'Full' : `${spotsLeft} left`}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-slate-900 font-semibold text-lg">{attendeeCount}</span>
                      <span className="text-slate-400 text-sm">/ {event.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPercent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isFull ? 'bg-red-500' : isNearlyFull ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500 text-xs mb-1">Attending</p>
                    <p className="text-slate-900 font-semibold text-lg">
                      {attendeeCount} {attendeeCount === 1 ? 'student' : 'students'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </aside>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;
