import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

function EventCalendar({ events }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsForDate, setEventsForDate] = useState([]);
  const navigate = useNavigate();

  // Format date to match event dates
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Find events for the selected date
  useEffect(() => {
    if (events && events.length > 0) {
      const formattedSelectedDate = formatDate(selectedDate);
      const eventsOnDate = events.filter(event => 
        event.date.split('T')[0] === formattedSelectedDate
      );
      setEventsForDate(eventsOnDate);
    }
  }, [selectedDate, events]);

  // Custom tile content to show event indicators
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = formatDate(date);
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Event Calendar</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            className="border-0"
          />
        </div>
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-medium mb-3 text-gray-700">
            Events on {selectedDate.toLocaleDateString()}
          </h3>
          {eventsForDate.length > 0 ? (
            <div className="space-y-3">
              {eventsForDate.map(event => (
                <div 
                  key={event._id}
                  className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  <h4 className="font-medium text-blue-800">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {event.startTime} - {event.endTime}
                  </p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No events scheduled for this date</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCalendar; 