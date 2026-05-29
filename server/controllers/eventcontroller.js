const Event = require('../models/Event');

// Helper: shape an event for public consumption (no PII from registeredUsers)
const publicEventShape = (event) => {
  const obj = event.toObject ? event.toObject() : { ...event };
  const attendeeCount = Array.isArray(obj.registeredUsers) ? obj.registeredUsers.length : 0;
  delete obj.registeredUsers;
  obj.attendeeCount = attendeeCount;
  return obj;
};

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
// Get all upcoming events, with optional filters: search, category, committee, from, to
exports.getAllUpcomingEvents = async (req, res) => {
  try {
    const { search, category, committee, from, to } = req.query;

    const query = { status: 'upcoming' };

    if (search) {
      const r = new RegExp(search, 'i');
      query.$or = [
        { title: r },
        { committeeName: r },
        { shortDescription: r },
        { eventDescription: r },
        { location: r },
      ];
    }

    if (category) {
      const cats = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (cats.length > 0) query.category = { $in: cats };
    }

    if (committee) {
      query.committeeName = new RegExp(`^${committee.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.status(200).json(events.map(publicEventShape));
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// List unique committee names + categories for filter UI population
exports.getFilterMetadata = async (req, res) => {
  try {
    const committees = await Event.distinct('committeeName', { status: 'upcoming' });
    res.json({
      committees: committees.filter(Boolean).sort(),
      categories: ['Workshop', 'Talk', 'Fest', 'Sports', 'Cultural', 'Other'],
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
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

// (Optional) Get a specific event — sanitized, no PII
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(publicEventShape(event));
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching event', error: err.message });
  }
};

// Committee-protected: list attendees for an event owned by the requesting committee
exports.getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    if (event.createdBy.toString() !== req.committeeId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this event\'s attendees' });
    }
    const attendees = (event.registeredUsers || []).map((u) => ({
      studentId: u.studentId,
      name: u.name,
      email: u.email,
      registrationDate: u.registrationDate,
    }));
    res.json({
      attendees,
      total: attendees.length,
      capacity: event.capacity ?? null,
    });
  } catch (err) {
    console.error('Get attendees error:', err);
    res.status(500).json({ msg: 'Error fetching attendees' });
  }
};