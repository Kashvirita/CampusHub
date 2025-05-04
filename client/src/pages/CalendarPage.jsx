import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventsForDate, setEventsForDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events/upcoming/all');
        setEvents(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
      const eventsOnDate = events.filter(event => 
        event.date.split('T')[0] === formattedSelectedDate
      );
      setEventsForDate(eventsOnDate);
    }
  }, [selectedDate, events]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      const hasEvents = events.some(event => 
        event.date.split('T')[0] === formattedDate
      );
      
      return hasEvents ? (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
        </div>
      ) : null;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600">Loading calendar...</div>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Event Calendar</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="border-0 w-full"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Events on {selectedDate.toLocaleDateString()}
              </h2>
              {eventsForDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForDate.map(event => (
                    <div
                      key={event._id}
                      className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/event/${event._id}`}
                    >
                      <h3 className="font-medium text-blue-800">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.startTime} - {event.endTime}
                      </p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      <div className="mt-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {event.committeeName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No events scheduled for this date
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage; 