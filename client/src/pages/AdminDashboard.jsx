import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Use this library to decode the JWT token
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import AdminEventCard from '../components/AdminEventCard';
import committeeImg from '../assets/committee.webp';
const API = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [committeeId, setCommitteeId] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = async (committeeId) => {
    try {
      const token = localStorage.getItem('authToken'); // get the JWT token
  
      const res = await fetch(`${API}/api/admin/events/${committeeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // optional if using cookies
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }
  
      const data = await res.json();
  
      if (!data || data.length === 0) {
        console.log('No events found for this committee.');
        return;
      }
  
      const today = new Date().toISOString().split('T')[0];
      const upcoming = data.filter((event) => event.date >= today);
      const past = data.filter((event) => event.date < today);
  
      setUpcomingEvents(upcoming);
      setPastEvents(past.reverse());
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };
  useEffect(() => {
    // Get committee ID from localStorage 
    const storedCommitteeId = localStorage.getItem('committeeId');
    
    // Alternatively, decode the stored token (if you want to be sure it's valid)
    const storedToken = localStorage.getItem('authToken');
    
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        console.log('Decoded token:', decodedToken);
        
        // Get committeeId from the decoded token
        const committeeIdFromToken = decodedToken.committeeId || decodedToken.id;
        
        if (committeeIdFromToken) {
          setCommitteeId(committeeIdFromToken);
          fetchEvents(committeeIdFromToken);
        } else if (storedCommitteeId) {
          // Fallback to stored committeeId if not in token
          setCommitteeId(storedCommitteeId);
          fetchEvents(storedCommitteeId);
        } else {
          console.log('No committeeId found');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error decoding JWT:', error);
        
        // Fallback to stored committeeId if token decoding fails
        if (storedCommitteeId) {
          setCommitteeId(storedCommitteeId);
          fetchEvents(storedCommitteeId);
        } else {
          navigate('/login');
        }
      }
    } else if (storedCommitteeId) {
      // Use storedCommitteeId if no token is available
      setCommitteeId(storedCommitteeId);
      fetchEvents(storedCommitteeId);
    } else {
      console.log('No authentication found');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('committeeToken');
    localStorage.removeItem('committeeId');
    
    // Call logout endpoint to clear the HTTP-only cookie
    fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      navigate('/login');
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="relative w-full h-64 overflow-hidden">
        <img src={committeeImg} alt="Committee" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-white text-4xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate(`/admin/create-event/${committeeId}`)} // Pass committeeId to event creation page
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Create New Event
          </button>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <AdminEventCard
                  key={event._id}
                  id= {event._id}
                  title={event.title}
                  description={event.shortDescription}
                  date={event.date}
                  startTime={event.startTime}
                  endTime={event.endTime}
                  imageUrl={event.imageUrl}
                  location={event.location}
                  committee={event.committeeName}/>
              ))
            ) : (
              <p className="text-gray-600">No upcoming events.</p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Past Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.length > 0 ? (
              pastEvents.map(event => (
                <AdminEventCard
                  key={event._id}
                  id={event._id}
                  title={event.title}
                  description={event.shortDescription}
                  date={event.date}
                  startTime={event.startTime}
                  endTime={event.endTime}
                  imageUrl={event.imageUrl}
                  location={event.location}
                  committee={event.committeeName}/>
              ))
            ) : (
              <p className="text-gray-600">No past events.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
