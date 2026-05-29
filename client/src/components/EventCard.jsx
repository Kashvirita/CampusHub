import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const categoryColors = {
  Workshop: 'bg-violet-50 text-violet-700 border-violet-200',
  Talk: 'bg-blue-50 text-blue-700 border-blue-200',
  Fest: 'bg-pink-50 text-pink-700 border-pink-200',
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cultural: 'bg-amber-50 text-amber-700 border-amber-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200',
};

function EventCard({ id, title, description, date, startTime, endTime, imageUrl, location, committee, category, capacity, attendeeCount = 0 }) {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hasCapacity = capacity != null && capacity > 0;
  const spotsLeft = hasCapacity ? capacity - attendeeCount : null;
  const isFull = hasCapacity && spotsLeft <= 0;
  const isNearlyFull = hasCapacity && spotsLeft > 0 && spotsLeft <= Math.max(5, capacity * 0.1);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#2E5AA7]/40 hover:shadow-lg transition-all h-full flex flex-col"
    >
      <Link to={`/event/${id}`} className="flex flex-col h-full">
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src={imageUrl || '/default-event.jpg'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {committee && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-medium text-[#2E5AA7] px-2.5 py-1 rounded-full">
              {committee}
            </span>
          )}
          {category && (
            <span className={`absolute top-3 right-3 text-[10px] font-medium border px-2 py-0.5 rounded-full backdrop-blur ${categoryColors[category] || categoryColors.Other}`}>
              {category}
            </span>
          )}
          {isFull && (
            <span className="absolute bottom-3 left-3 text-[10px] font-medium bg-red-500/95 backdrop-blur text-white px-2 py-0.5 rounded-full">
              Full
            </span>
          )}
          {isNearlyFull && !isFull && (
            <span className="absolute bottom-3 left-3 text-[10px] font-medium bg-amber-500/95 backdrop-blur text-white px-2 py-0.5 rounded-full">
              {spotsLeft} left
            </span>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-slate-900 mb-1.5 leading-snug line-clamp-1 group-hover:text-[#2E5AA7] transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{description}</p>
          )}

          <div className="space-y-1.5 text-xs text-slate-500 mt-auto">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-[#2E5AA7] text-[11px]" />
              <span>{formattedDate}</span>
            </div>
            {(startTime || endTime) && (
              <div className="flex items-center gap-2">
                <FaClock className="text-[#2E5AA7] text-[11px]" />
                <span>{startTime} – {endTime}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#2E5AA7] text-[11px]" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-[#2E5AA7] group-hover:text-[#244a8c]">
              View details
            </span>
            <svg className="w-4 h-4 text-[#2E5AA7] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default EventCard;
