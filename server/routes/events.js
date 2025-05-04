const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const eventController = require('../controllers/eventcontroller');

// Public routes
router.get('/upcoming/all', eventController.getAllUpcomingEvents);
router.get('/event/:eventId', eventController.getEventById);

// Protected routes
router.use(authMiddleware);

// Create event for a specific committee
router.post('/:committeeId', eventController.createEvent);

// Get all events created by a specific committee (past and upcoming)
router.get('/:committeeId', eventController.getCommitteeEvents);

// Update a specific event by ID
router.put('/event/:eventId', eventController.updateEvent);

// Delete a specific event by ID
router.delete('/event/:eventId', eventController.deleteEvent);

module.exports = router;
