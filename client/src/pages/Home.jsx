import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import Footer from '../components/Footer';

function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const eventsRef = useRef(null);
  const aboutRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/upcoming/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();

        if (!data || data.length === 0) {
          console.log('No events found.');
          setUpcomingEvents([]);
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const upcoming = data.filter((event) => event.date >= today);
        setUpcomingEvents(upcoming);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  

  // Scroll to section based on hash
  useEffect(() => {
    if (location.hash === '#events' && eventsRef.current) {
      eventsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (location.hash === '#about' && aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-[400px] bg-cover bg-center" style={{ backgroundImage: 'url("https://source.unsplash.com/featured/?university,campus")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center">
          <h1 className="text-4xl font-bold mb-2">Explore Campus Events</h1>
          <p className="text-lg">Discover & Manage University Events Effortlessly</p>
        </div>
      </div>

      {/* Upcoming Events */}
      <section className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>

        {loading ? (
          <p className="text-gray-600">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => {
                console.log('Rendering EventCard with ID:', event._id); // Log the ID here
                return (
                  <EventCard
                    key={event._id}
                    id={event._id}  // Pass the event ID to the EventCard
                    title={event.title}
                    description={event.shortDescription}
                    date={event.date}
                    startTime={event.startTime}
                    endTime={event.endTime}
                    imageUrl={event.imageUrl}
                    location={event.location}
                    committee={event.committeeName}
                  />
                );
              })
            ) : (
              <p>No events found.</p>
            )}

          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Home;
