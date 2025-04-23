const Event = require('../models/Event');

// Create an event
exports.createEvent = async (req, res) => {
    try {
      const {
        title,
        shortDescription,
        eventDescription,
        committeeName,
        date,
        startTime,
        endTime,
        location,
        host,
        imageUrl,
        status,
      } = req.body;
  
      // Basic validation (optional)
      if (!title || !shortDescription || !eventDescription || !committeeName || !date || !startTime || !endTime || !location || !host) {
        return res.status(400).json({ msg: 'Missing required fields' });
      }
  
      const event = new Event({
        title,
        shortDescription,
        eventDescription,
        committeeName,
        date,
        startTime,
        endTime,
        location,
        host,
        imageUrl,
        status,
        createdBy: req.params.committeeId,  // Committee ID from route
      });
  
      await event.save();
      res.status(201).json({ msg: 'Event created', event });
    } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).json({ msg: 'Error creating event', error: err.message });
    }
};

// Get events created by a specific committee
exports.getCommitteeEvents = async (req, res) => {
  if (req.committeeId !== req.params.committeeId) {
    return res.status(403).json({ msg: 'Access denied: committee mismatch' });
  }
  console.log("From token:", req.committeeId);
  console.log("From params:", req.params.committeeId);

  try {
    const events = await Event.find({ createdBy: req.params.committeeId }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching events', error: err.message });
  }
};
// Get all upcoming events
exports.getAllUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({ date: { $gte: now } }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching upcoming events', error: err.message });
  }
};

// Update a specific event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.eventId, req.body, { new: true });
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json({ msg: 'Event updated', event });
  } catch (err) {
    res.status(500).json({ msg: 'Error updating event', error: err.message });
  }
};

// Delete a specific event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.eventId);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json({ msg: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting event', error: err.message });
  }
};

// (Optional) Get a specific event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching event', error: err.message });
  }
};