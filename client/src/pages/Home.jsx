import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import Footer from '../components/Footer';
import intro_image from '../assets/images/intro_image.jpg';
const API = import.meta.env.VITE_API_BASE_URL;

function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const eventsRef = useRef(null);
  const aboutRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API}/api/events/upcoming/all`, {
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

  // Scroll to section based on hash or manual trigger
  useEffect(() => {
    if (location.hash === '#events' && eventsRef.current) {
      eventsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (location.hash === '#about' && aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-[400px]">
        <img
          src={intro_image}
          alt="Campus Intro"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-black text-center">
          <h1 className="text-4xl font-bold mb-2">Explore Campus Events</h1>
          <p className="text-lg mb-4">Discover & Manage University Events Effortlessly</p>
          <button
            onClick={scrollToEvents}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Upcoming Events
          </button>
        </div>
      </div>

      {/* Upcoming Events */}
      <section ref={eventsRef} className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>

        {loading ? (
          <p className="text-gray-600">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <EventCard
                  key={event._id}
                  id={event._id}
                  title={event.title}
                  description={event.shortDescription}
                  date={event.date}
                  startTime={event.startTime}
                  endTime={event.endTime}
                  imageUrl={event.imageUrl}
                  location={event.location}
                  committee={event.committeeName}
                />
              ))
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
