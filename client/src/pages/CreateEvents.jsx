import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { FaImage, FaArrowLeft } from 'react-icons/fa';
const API = import.meta.env.VITE_API_BASE_URL;

const CreateEvents = () => {
  const { committeeID } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: '',
    shortDescription: '',
    eventDescription: '',
    committeeName: '',
    category: 'Other',
    capacity: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    host: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const required = ['title', 'shortDescription', 'eventDescription', 'date', 'startTime', 'endTime', 'location', 'host'];
    if (required.some((f) => !eventData[f])) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Not authenticated.');
      setLoading(false);
      return;
    }

    try {
      let imageUrl = eventData.imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch(`${API}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Image upload failed');
        imageUrl = uploadData.imageUrl;
      }

      if (!imageUrl) {
        setError('Please attach an event image.');
        setLoading(false);
        return;
      }

      const payload = {
        ...eventData,
        imageUrl,
        createdBy: committeeID,
        capacity: eventData.capacity === '' ? null : Number(eventData.capacity),
      };

      const res = await fetch(`${API}/api/admin/events/${committeeID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Event created.');
        navigate(`/admin/dashboard/${committeeID}`);
      } else {
        const errText = await res.text();
        setError('Failed to create event: ' + errText);
      }
    } catch (err) {
      setError('Error creating event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = ['Workshop', 'Talk', 'Fest', 'Sports', 'Cultural', 'Other'];

  const fields = [
    { name: 'title', label: 'Event title', placeholder: 'e.g. Spring Hackathon', type: 'text' },
    { name: 'committeeName', label: 'Committee name', placeholder: 'e.g. Tech Society', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: categoryOptions },
    { name: 'capacity', label: 'Capacity (leave blank for unlimited)', placeholder: 'e.g. 100', type: 'number', optional: true },
    { name: 'shortDescription', label: 'Short description', placeholder: 'One-line teaser', type: 'textarea' },
    { name: 'eventDescription', label: 'Full description', placeholder: 'Tell attendees what to expect…', type: 'textarea' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'startTime', label: 'Start time', type: 'time' },
    { name: 'endTime', label: 'End time', type: 'time' },
    { name: 'location', label: 'Location', placeholder: 'e.g. Main Auditorium', type: 'text' },
    { name: 'host', label: 'Host', placeholder: 'e.g. Dr. Jane Smith', type: 'text' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/admin/dashboard/${committeeID}`)}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#2E5AA7] mb-6 transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back to dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">New event</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Create an event</h1>
          <p className="text-sm text-slate-500 mt-2">Fill in the details — students will see it instantly.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-8 space-y-5 shadow-sm"
        >
          {message && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-3 py-2.5 rounded-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={eventData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    rows={field.name === 'eventDescription' ? 5 : 2}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition resize-none"
                    required
                  />
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={eventData[field.name]}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                    required
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={eventData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    min={field.type === 'number' ? 1 : undefined}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                    required={!field.optional}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Event image</label>
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                imageFile ? 'border-[#2E5AA7]/40 bg-slate-50' : 'border-slate-200 hover:border-[#2E5AA7]/40 hover:bg-slate-50'
              }`}>
                {imageFile ? (
                  <div>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <p className="text-sm text-slate-700 font-medium">{imageFile.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click to change</p>
                  </div>
                ) : (
                  <>
                    <FaImage className="text-2xl text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Click to upload</p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium py-2.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating…' : 'Create event'}
            </motion.button>
            <button
              type="button"
              onClick={() => navigate(`/admin/dashboard/${committeeID}`)}
              className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </main>
    </div>
  );
};

export default CreateEvents;
