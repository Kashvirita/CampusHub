import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CreateEvents = () => {
  const { committeeID } = useParams();
  const [eventData, setEventData] = useState({
    title: '',
    shortDescription: '',
    eventDescription: '',
    committeeName: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    host: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null); // 🆕
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
  
    if (
      !eventData.title ||
      !eventData.shortDescription ||
      !eventData.eventDescription ||
      !eventData.date ||
      !eventData.startTime ||
      !eventData.endTime ||
      !eventData.location ||
      !eventData.host
    ) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
  
    const token = localStorage.getItem('authToken'); // Ensure token is correct
    if (!token) {
      console.error("No token found.");
      return;
    }
  
    try {
      // Upload image first if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
  
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        const uploadData = await uploadRes.json();
        console.log('Image upload response:', uploadData);
  
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || 'Image upload failed');
        }
  
        // Set the image URL after successful upload
        setEventData(prev => ({ ...prev, imageUrl: uploadData.imageUrl }));
      }
  
      // Check if imageUrl is set
      if (!eventData.imageUrl) {
        setError('Image URL is missing.');
        setLoading(false);
        return;
      }
  
      // Create event with the imageUrl included
      const res = await fetch(`http://localhost:5000/api/admin/events/${committeeID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...eventData, // Should include imageUrl
          createdBy: committeeID,
        }),
      });
  
      const responseText = await res.text();
      console.log('Backend Response:', responseText);
  
      if (res.ok) {
        setMessage('Event created successfully!');
        navigate(`/admin/dashboard/${committeeID}`);
      } else {
        const errorText = await res.text();
        console.error('Backend Error:', errorText);
        setError('Failed to create event: ' + errorText);
      }
    } catch (error) {
      setError('Error creating event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Create Event Form</h2>

          {message && <div className="mb-4 text-green-600">{message}</div>}
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Standard fields */}
            {[
              ['title', 'Event Title', 'e.g. Community Service Day'],
              ['shortDescription', 'Short Description', 'e.g. City cleaning for seniors'],
              ['eventDescription', 'Event Description', 'e.g. We’re cleaning the beach...'],
              ['committeeName', 'Committee Name', 'e.g. City Clean-Up'],
              ['date', 'Event Date', ''],
              ['startTime', 'Start Time', ''],
              ['endTime', 'End Time', ''],
              ['location', 'Location', 'e.g. Central Park, NY'],
              ['host', 'Host', 'e.g. McKinley National Harbor'],
            ].map(([name, label, placeholder]) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                {(name === 'eventDescription' || name === 'shortDescription') ? (
                  <textarea
                    name={name}
                    value={eventData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    rows={3}
                    required
                  />
                ) : (
                  <input
                    type={name === 'date' ? 'date' : name.includes('Time') ? 'time' : 'text'}
                    name={name}
                    value={eventData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    required
                  />
                )}
              </div>
            ))}

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Event Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mt-2"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvents;