import React from 'react';
// You can use a Lucide icon from the allowed list, like "search":
import { Search } from "lucide-react";
 
function Searchbar({ onSearch }) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search events..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full py-3 pl-11 pr-4 bg-white/50 rounded-xl border border-blue-200 shadow-inner text-blue-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150"
      />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
        <Search size={20} />
      </span>
    </div>
  );
}
 
export default Searchbar;
