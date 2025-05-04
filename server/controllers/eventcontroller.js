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
    const { search } = req.query;

    const query = {
      status: 'upcoming',
    };

    // If there is a search query, add the conditions for filtering by title, committeeName, etc.
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive
      query.$or = [
        { title: searchRegex },
        { committeeName: searchRegex },
        { shortDescription: searchRegex },
        { eventDescription: searchRegex },
      ];
    }

    // Fetch events from the database based on the query
    const events = await Event.find(query).sort({ date: 1 }); // Sort by date

    // Send the events array as a response
    res.status(200).json(events); // Just send the events array directly
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a specific event
exports.updateEvent = async (req, res) => {
  try {
    // Validate event ID
    if (!req.params.eventId) {
      return res.status(400).json({ msg: 'Event ID is required' });
    }

    // Validate committee ID
    if (!req.committeeId) {
      return res.status(401).json({ msg: 'Unauthorized: Committee ID not found' });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if the logged-in committee is the creator
    if (event.createdBy.toString() !== req.committeeId) {
      return res.status(403).json({ msg: 'Access denied: not your event' });
    }

    // Validate required fields in the update
    const { title, shortDescription, eventDescription, date, startTime, endTime, location, host } = req.body;
    if (!title || !shortDescription || !eventDescription || !date || !startTime || !endTime || !location || !host) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { 
        new: true,
        runValidators: true // This ensures mongoose validators run on update
      }
    );

    if (!updatedEvent) {
      return res.status(500).json({ msg: 'Failed to update event' });
    }

    res.json({ msg: 'Event updated successfully', event: updatedEvent });
  } catch (err) {
    console.error('Error updating event:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error', error: err.message });
    }
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