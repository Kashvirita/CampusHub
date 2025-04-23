import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function AllEventsPage() {
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');

  useEffect(() => {
    const fetchEvents = async () => {
        try {
          // Make sure to pass the search query in the request
          const res = await axios.get('/api/events/upcoming/all', {
            params: { search: searchQuery }, // Pass the search query in the URL
          });
      
          console.log("Response from backend:", res.data); // Log the events array for debugging
      
          let allEvents = res.data; // Now, res.data is directly the events array
      
          // Apply additional search filtering on the frontend if necessary
          if (searchQuery) {
            allEvents = allEvents.filter(event =>
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.committeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.eventDescription.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
      
          setEvents(allEvents); // Update the state with the fetched events
        } catch (err) {
          console.error('Failed to fetch events:', err);
        }
      };
    fetchEvents();
  }, [searchQuery]);

  return (
    <div>
      <h1>Upcoming Events</h1>
      <ul>
        {events.map(event => (
          <li key={event._id}>{event.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default AllEventsPage;
