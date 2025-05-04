import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
const API = import.meta.env.VITE_API_BASE_URL;

const AdminEventDetails = () => {
  const storedCommitteeId = localStorage.getItem('committeeId');
  const { id } = useParams();
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    console.log("Fetching event with ID:", id);
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API}/api/admin/events/event/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();
        console.log("Event data fetched:", data);
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
          status: data.status || 'Upcoming',
        });
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleUpdate = async () => {
    console.log("Token:", token ? "Present" : "Missing");
    console.log("Updating event with ID:", id);
    console.log("Form data to update:", formData);
    try {
      console.log("Making request to:", `http://localhost:5000/api/admin/events/event/${id}`);
      const res = await fetch(`http://localhost:5000/api/admin/events/event/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server response error:", errorData);
        throw new Error(errorData.msg || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Update response:", data);
      alert(data.msg);
      if (data.event) {
        setEvent(data.event);
        setEditing(false);
      }
    } catch (err) {
      console.error("Detailed error:", err);
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    console.log("Deleting event with ID:", id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/events/event/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("Delete response:", data);
      alert(data.msg);
      navigate(`/admin/dashboard/${id}`);
    } catch (err) {
      alert('Delete failed');
      console.error("Error during deletion:", err);
    }
  };

  const generateTimeSlots = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  if (loading) return <div className="text-center p-10">Loading event...</div>;
  if (!event) return <div className="text-center p-10 text-red-500">Event not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin: Event Details</h1>

      <img
        src={event.imageUrl || '/default-event.jpg'}
        alt={event.title}
        className="w-full h-[300px] object-cover rounded shadow mb-6"
      />

      <div className="space-y-4 text-gray-600">
        {editing ? (
          <>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
            />
            <textarea
              className="w-full p-2 border rounded"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Short Description"
            />
            <textarea
              className="w-full p-2 border rounded"
              value={formData.eventDescription}
              onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
              placeholder="Event Description"
            />
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.date?.substring(0, 10)}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <select
              className="w-full p-2 border rounded"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            >
              <option value="">Select Start Time</option>
              {generateTimeSlots().map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <select
              className="w-full p-2 border rounded"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            >
              <option value="">Select End Time</option>
              {generateTimeSlots().map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Location"
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              placeholder="Host"
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.committeeName}
              onChange={(e) => setFormData({ ...formData, committeeName: e.target.value })}
              placeholder="Committee Name"
            />
            <select
              className="w-full p-2 border rounded"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" /> Date: {new Date(event.date).toDateString()}
            </p>
            <p className="flex items-center gap-2">
              <FaClock className="text-blue-500" /> Time: {event.startTime} – {event.endTime}
            </p>
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" /> Location: {event.location}
            </p>
            <p className="flex items-center gap-2">
              <FaUsers className="text-blue-500" /> Committee: {event.committeeName}
            </p>
            <p>Description: {event.description}</p>
            <p>
              Status:{' '}
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  event.status === 'Upcoming'
                    ? 'bg-green-100 text-green-700'
                    : event.status === 'Ongoing'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {event.status}
              </span>
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        {editing ? (
          <>
            <button onClick={handleUpdate} className="bg-green-600 text-white px-6 py-2 rounded shadow">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="bg-gray-500 text-white px-6 py-2 rounded shadow">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="bg-yellow-500 text-white px-6 py-2 rounded shadow">
              Edit
            </button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-6 py-2 rounded shadow">
              Delete
            </button>
          </>
        )}
        <button onClick={() => navigate(`/admin/dashboard/${id}`)} className="text-blue-600 underline">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminEventDetails;
