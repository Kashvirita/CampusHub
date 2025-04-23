import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

function Searchbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      console.log('Searching for:', searchTerm);  // Debugging line
      navigate(`/events/upcoming?search=${encodeURIComponent(searchTerm)}`);
    } else {
      console.log('Search term is empty');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search events..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full py-3 pl-11 pr-4 bg-white/50 rounded-xl border border-blue-200 shadow-inner text-blue-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150"
      />
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"
        onClick={handleSearch}
      >
        <Search size={20} />
      </button>
    </div>
  );
}

export default Searchbar;
