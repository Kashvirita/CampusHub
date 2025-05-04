import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
const API = import.meta.env.VITE_API_BASE_URL;

const EventDetails = () => {
  const { id } = useParams(); // Get 'id' from the URL
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Update the API URL to match your backend's expected route
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
  }, [id]); // Re-run the fetch whenever the `id` changes

  if (loading) return <div className="text-center p-10">Loading event...</div>;
  if (!event) return <div className="text-center p-10 text-red-500">Event not found</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <img
        src={event.imageUrl || '/default-event.jpg'}
        alt={event.title}
        className="w-full h-[300px] object-cover mt-4 rounded shadow-md"
      />
      <main className="flex-grow px-6 py-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{event.title}</h1>

        <div className="space-y-4 text-gray-600">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <span>Date: {new Date(event.date).toDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-blue-500" />
            <span>Time: {event.startTime} - {event.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            <span>Location: {event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-blue-500" />
            <span>Hosted by: {event.committeeName}</span>
          </div>

          <div className="text-md text-gray-700 mt-6 leading-7">{event.description}</div>

          <div className="mt-6">
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold 
              ${event.status === 'Upcoming'
                  ? 'bg-green-100 text-green-700'
                  : event.status === 'Ongoing'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'}`}>
              Status: {event.status}
            </span>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => alert('You have registered for this event!')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
            >
              Register
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:underline"
            >
              Back to Events
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;
