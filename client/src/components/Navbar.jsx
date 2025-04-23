import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';
 
function Navbar() {
  const token = localStorage.getItem('authToken'); // 🧠 Check for token
  const navigate = useNavigate();
 
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // 🔐 Clear token
    navigate('/'); // 🔄 Redirect to login
  };
 
  return (
    <nav className="relative z-10 bg-white/70 backdrop-blur-md border-b border-blue-100 shadow-lg py-4 px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 rounded-b-2xl">
      {/* Logo & Links */}
      <div className="flex items-center space-x-3">
        {/* <img src="/logo.svg" alt="Logo" className="w-8 h-8 drop-shadow-md" /> */}
        <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight font-sans hover:text-blue-800 transition-colors">CampusHub</Link>
      </div>
      {/* Navigation Links */}
      <div className="flex space-x-6 items-center text-gray-700 font-medium">
        <Link to="/" className="relative hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-500 hover:text-blue-700 transition-colors">Home</Link>
        <Link to="/events" className="relative hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-500 hover:text-blue-700 transition-colors">Events</Link>
        <Link to="/about" className="relative hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-500 hover:text-blue-700 transition-colors">About</Link>
        {token && (
          <Link to="/admin/dashboard" className="relative hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-violet-500 hover:text-violet-700 transition-colors">Dashboard</Link>
        )}
      </div>
      {/* Search + Calendar + Auth */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search events..."
            className="border border-gray-200 bg-white/70 backdrop-blur px-4 py-2 text-sm rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 w-44 sm:w-64"
          />
        </div>
        <button className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors rounded-full p-2 shadow-sm text-xl" title="View by date">
          <FaCalendarAlt />
        </button>
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