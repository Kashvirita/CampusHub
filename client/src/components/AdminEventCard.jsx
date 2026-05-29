import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPen } from 'react-icons/fa';

const categoryColors = {
  Workshop: 'bg-violet-50 text-violet-700 border-violet-200',
  Talk: 'bg-blue-50 text-blue-700 border-blue-200',
  Fest: 'bg-pink-50 text-pink-700 border-pink-200',
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cultural: 'bg-amber-50 text-amber-700 border-amber-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200',
};

function AdminEventCard({ id, title, description, date, startTime, endTime, imageUrl, location, committee, category }) {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#FFA628]/60 hover:shadow-lg transition-all"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={imageUrl || '/default-event.jpg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-[#FFA628] text-xs font-medium text-slate-900 px-2.5 py-1 rounded-full">
          Admin
        </span>
        {category && (
          <span className={`absolute top-3 right-3 text-[10px] font-medium border px-2 py-0.5 rounded-full backdrop-blur ${categoryColors[category] || categoryColors.Other}`}>
            {category}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-slate-900 mb-1.5 leading-snug line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{description}</p>
        )}

        <div className="space-y-1.5 text-xs text-slate-500">
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

        <Link to={`/admin/event/${id}`}>
          <button className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-[#2E5AA7] hover:text-white text-[#2E5AA7] text-sm font-medium py-2 rounded-lg transition-colors">
            <FaPen className="text-[11px]" /> Manage Event
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default AdminEventCard;
