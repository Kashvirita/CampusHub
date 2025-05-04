import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';
const API = import.meta.env.VITE_API_BASE_URL;
function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Make sure to pass the search query in the request
        const res = await axios.get(`${API}/api/events/upcoming/all`, {
          params: { search: searchQuery }, // Pass the search query in the URL
        });
    
        console.log("Response from backend:", res.data);
    
        let allEvents = res.data;
    
        // Apply additional search filtering on the frontend if necessary
        if (searchQuery) {
          const searchTerms = searchQuery.toLowerCase().split(' ');
          allEvents = allEvents.filter(event => {
            const searchableText = [
              event.title,
              event.shortDescription,
              event.eventDescription,
              event.committeeName,
              event.location
            ].join(' ').toLowerCase();
            
            return searchTerms.some(term => searchableText.includes(term));
          });
        }
    
        setEvents(allEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Upcoming Events'}
        </h1>
        
        {events.length === 0 ? (
          <div className="text-center text-gray-600">
            {searchQuery 
              ? `No events found matching "${searchQuery}"`
              : 'No upcoming events found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;
