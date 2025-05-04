import { Link } from 'react-router-dom';

function EventCard({ id, title, description, date, startTime, endTime, imageUrl, location, committee }) {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition transform hover:scale-[1.02]">
      <img
        src={imageUrl || '/default-event.jpg'}
        alt={title}
        className="w-full h-64 object-cover object-top"
      />
      <div className="p-5">
        <h3 className="font-semibold text-2xl mb-3 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <p className="text-sm text-gray-500 mb-1">
          <strong>Date:</strong> {formattedDate}
        </p>
        <p className="text-sm text-gray-500 mb-1">
          <strong>Time:</strong> {startTime} – {endTime}
        </p>
        <p className="text-sm text-gray-500 mb-1">
          <strong>Location:</strong> {location}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          <strong>Committee:</strong> {committee}
        </p>

        {/* More Details Button */}
        <Link to={`/admin/event/${id}`}>
          <button className="text-blue-600 hover:underline font-semibold">
            Edit
          </button>
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
