import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaPen, FaTrash, FaDownload } from 'react-icons/fa';
const API = import.meta.env.VITE_API_BASE_URL;

const AdminEventDetails = () => {
  const { id } = useParams();
  const token = localStorage.getItem('authToken');
  const committeeId = localStorage.getItem('committeeId');
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [attendees, setAttendees] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API}/api/admin/events/event/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();
        setEvent(data);
        setFormData({
          title: data.title || '',
          shortDescription: data.shortDescription || '',
          eventDescription: data.eventDescription || '',
          date: data.date || '',
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          location: data.location || '',
          host: data.host || '',
          committeeName: data.committeeName || '',
          category: data.category || 'Other',
          capacity: data.capacity ?? '',
          status: data.status || 'upcoming',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchAttendees = async () => {
      setAttendeesLoading(true);
      try {
        const res = await fetch(`${API}/api/admin/events/event/${id}/attendees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAttendees(data.attendees || []);
        }
      } catch (err) {
        console.error('Attendees fetch error:', err);
      } finally {
        setAttendeesLoading(false);
      }
    };
    if (token) fetchAttendees();
  }, [id, token]);

  const exportAttendeesCsv = () => {
    if (attendees.length === 0) return;
    const header = ['Name', 'Email', 'Registered On'];
    const rows = attendees.map((a) => [
      a.name || '',
      a.email || '',
      a.registrationDate ? new Date(a.registrationDate).toISOString() : '',
    ]);
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(event?.title || 'event').replace(/[^\w\-]+/g, '_')}_attendees.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ...formData,
        capacity: formData.capacity === '' || formData.capacity == null ? null : Number(formData.capacity),
      };
      const res = await fetch(`${API}/api/admin/events/event/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.event) {
        setEvent(data.event);
        setEditing(false);
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await fetch(`${API}/api/admin/events/event/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      navigate(`/admin/dashboard/${committeeId}`);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const generateTimeSlots = () => {
    const times = [];
    for (let h = 0; h < 24; h++)
      for (let m = 0; m < 60; m += 30)
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    return times;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          <div className="bg-slate-100 animate-pulse rounded-2xl h-[400px]" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Event not found</p>
        </div>
      </div>
    );
  }

  const inputCls =
    'w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <button
          onClick={() => navigate(`/admin/dashboard/${committeeId}`)}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#2E5AA7] mb-6 transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back to dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden bg-slate-100 mb-8"
        >
          <img
            src={event.imageUrl || '/default-event.jpg'}
            alt={event.title}
            className="w-full h-[360px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block bg-[#FFA628] text-xs font-medium text-slate-900 px-2.5 py-1 rounded-full mb-2">
              Admin view
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <div className="md:col-span-2 space-y-6">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Title</label>
                  <input
                    className={inputCls}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Short description</label>
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Full description</label>
                  <textarea
                    className={inputCls}
                    rows={5}
                    value={formData.eventDescription}
                    onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Date</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={formData.date?.substring(0, 10)}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
                    <select
                      className={inputCls}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Start time</label>
                    <select
                      className={inputCls}
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    >
                      <option value="">Select…</option>
                      {generateTimeSlots().map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">End time</label>
                    <select
                      className={inputCls}
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    >
                      <option value="">Select…</option>
                      {generateTimeSlots().map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Location</label>
                  <input
                    className={inputCls}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Host</label>
                  <input
                    className={inputCls}
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Committee name</label>
                  <input
                    className={inputCls}
                    value={formData.committeeName}
                    onChange={(e) => setFormData({ ...formData, committeeName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    className={inputCls}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {['Workshop', 'Talk', 'Fest', 'Sports', 'Cultural', 'Other'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Capacity <span className="text-slate-400 font-normal">(blank = unlimited)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g. 100"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleUpdate}
                    className="bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
                  >
                    Save changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-6 py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">About this event</p>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {event.eventDescription || event.shortDescription || event.description}
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <FaPen className="text-xs" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <FaTrash className="text-xs" /> Delete
                  </button>
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
                  <p className="text-slate-500 text-xs">Committee</p>
                  <p className="text-slate-900 font-medium">{event.committeeName}</p>
                </div>
              </div>
              {event.category && (
                <div className="flex items-start gap-3">
                  <span className="text-[#2E5AA7] mt-0.5 text-xs font-bold">#</span>
                  <div>
                    <p className="text-slate-500 text-xs">Category</p>
                    <p className="text-slate-900 font-medium">{event.category}</p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200">
                <p className="text-slate-500 text-xs mb-1.5">Registrations</p>
                {event.capacity != null && event.capacity > 0 ? (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-slate-900 font-semibold text-lg">
                        {event.attendeeCount ?? 0}
                      </span>
                      <span className="text-slate-400 text-sm">/ {event.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2E5AA7] rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((event.attendeeCount ?? 0) / event.capacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-slate-900 font-semibold text-lg">
                    {event.attendeeCount ?? 0}
                    <span className="text-slate-400 text-sm font-normal ml-1">(unlimited)</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-slate-500 text-xs mb-1.5">Status</p>
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${
                    event.status === 'Upcoming'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : event.status === 'Ongoing'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </div>
          </aside>
        </motion.div>

        {/* Attendee list */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-1">Attendees</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Who's coming{' '}
                <span className="text-slate-400 font-normal text-lg">
                  · {attendees.length}{event.capacity ? ` / ${event.capacity}` : ''}
                </span>
              </h2>
            </div>
            {attendees.length > 0 && (
              <button
                onClick={exportAttendeesCsv}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-[#2E5AA7] text-slate-700 hover:text-[#2E5AA7] text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start sm:self-auto"
              >
                <FaDownload className="text-xs" /> Export CSV
              </button>
            )}
          </div>

          {attendeesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-100 animate-pulse rounded-xl h-14" />
              ))}
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500">No registrations yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Share the event link to start collecting RSVPs.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1.5fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium uppercase tracking-wider text-slate-500">
                <span>Name</span>
                <span>Email</span>
                <span>Registered</span>
              </div>
              <div className="divide-y divide-slate-100">
                {attendees.map((a, i) => (
                  <motion.div
                    key={a.studentId || `${a.email}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.02 }}
                    className="grid grid-cols-[1fr_1.5fr_auto] gap-4 px-5 py-3 items-center text-sm hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#2E5AA7]/10 text-[#2E5AA7] flex items-center justify-center text-xs font-semibold uppercase">
                        {(a.name || '?').charAt(0)}
                      </div>
                      <span className="text-slate-900 font-medium truncate">{a.name || '—'}</span>
                    </div>
                    <a
                      href={`mailto:${a.email}`}
                      className="text-slate-600 hover:text-[#2E5AA7] truncate text-xs sm:text-sm"
                    >
                      {a.email}
                    </a>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {a.registrationDate
                        ? new Date(a.registrationDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default AdminEventDetails;
