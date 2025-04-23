import React, { useState, useEffect } from 'react';
import SearchBar from '../components/Searchbar';
function EventList({ events }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    const filtered = events.filter((event) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.shortDescription.toLowerCase().includes(searchLower) ||
        event.eventDescription.toLowerCase().includes(searchLower) ||
        event.committee?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  return (
    <div className="p-4">
      <SearchBar onSearch={setSearchTerm} />
      <div className="grid gap-4 mt-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event._id} className="p-4 border rounded shadow">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p>{event.shortDescription}</p>
              <p className="text-sm text-gray-600">{event.committee}</p>
            </div>
          ))
        ) : (
          <p>No events match your search.</p>
        )}
      </div>
    </div>
  );
}

export default EventList;
