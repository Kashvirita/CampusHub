import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';
import Searchbar from './Searchbar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
const API = import.meta.env.VITE_API_BASE_URL;

function Navbar() {
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventsForDate, setEventsForDate] = useState([]);
  const [showEvents, setShowEvents] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API}/api/events/upcoming/all`);
        console.log('Raw events data:', response.data);
        
        // Process the events to ensure dates are in the correct format
        const processedEvents = response.data.map(event => ({
          ...event,
          date: new Date(event.date).toISOString() // Ensure date is in ISO format
        }));
        
        console.log('Processed events:', processedEvents);
        setEvents(processedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  const handleDateSelect = () => {
    setShowEvents(true);
    
    // Normalize the selected date to UTC midnight
    const selectedDateUTC = new Date(Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    ));
    const formattedSelectedDate = selectedDateUTC.toISOString().split('T')[0];
    
    console.log('Selected Date (UTC):', formattedSelectedDate);
    
    const eventsOnDate = events.filter(event => {
      // The event date is already in UTC format
      const eventDate = event.date.split('T')[0];
      console.log('Event Date:', eventDate, 'Event Title:', event.title);
      
      const isMatch = eventDate === formattedSelectedDate;
      console.log('Date Match:', isMatch);
      
      return isMatch;
    });
    
    console.log('Events found:', eventsOnDate);
    setEventsForDate(eventsOnDate);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      // Normalize the calendar date to UTC midnight
      const dateUTC = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ));
      const formattedDate = dateUTC.toISOString().split('T')[0];
      
      const hasEvents = events.some(event => {
        const eventDate = event.date.split('T')[0];
        return eventDate === formattedDate;
      });
      
      return hasEvents ? (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
        </div>
      ) : null;
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <nav className="relative z-10 bg-white/70 backdrop-blur-md border-b border-blue-100 shadow-lg py-4 px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 rounded-b-2xl">
      <div className="flex items-center space-x-3">
        <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight font-sans hover:text-blue-800 transition-colors">CampusHub</Link>
      </div>

      <div className="flex space-x-6 items-center text-gray-700 font-medium">
        <Link to="/" className="relative hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-500 hover:text-blue-700 transition-colors">Home</Link>
        <Link to="/events/upcoming" className="relative hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-500 hover:text-blue-700 transition-colors">Events</Link>
        <Link to="/#about" className="relative hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-500 hover:text-blue-700 transition-colors">About</Link>
        {token && (
          <Link to="/admin/dashboard" className="relative hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-violet-500 hover:text-violet-700 transition-colors">Dashboard</Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Searchbar />
        <div className="relative">
          <button 
            className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors rounded-full p-2 shadow-sm text-xl" 
            title="View by date"
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowEvents(false);
            }}
          >
            <FaCalendarAlt />
          </button>
          
          {showCalendar && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl p-4 z-50 w-80">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="border-0 w-full"
              />
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleDateSelect}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Go
                </button>
              </div>
              {showEvents && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Events on {selectedDate.toLocaleDateString()}
                  </h3>
                  {eventsForDate.length > 0 ? (
                    <div className="space-y-2">
                      {eventsForDate.map(event => (
                        <div
                          key={event._id}
                          className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                          onClick={() => {
                            navigate(`/event/${event._id}`);
                            setShowCalendar(false);
                          }}
                        >
                          <h4 className="font-medium text-blue-800">{event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.startTime} - {event.endTime}
                          </p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                          <div className="mt-2">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {event.committeeName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No events scheduled for this date</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-400 via-red-500 to-pink-400 text-white px-5 py-2 rounded-xl shadow hover:from-red-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
          >
            Logout
          </button>
        ) : (
          <Link to="/admin/register" className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white px-5 py-2 rounded-xl shadow hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all">
            Admin Registration
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
