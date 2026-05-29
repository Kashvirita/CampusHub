const express = require('express');
const router = express.Router();
const studentAuth = require('../middleware/studentAuthMiddleware');
const ctrl = require('../controllers/studentcontroller');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

router.get('/me', studentAuth, ctrl.getMe);
router.get('/my-events', studentAuth, ctrl.myEvents);
router.get('/rsvp/:eventId/check', studentAuth, ctrl.checkRegistration);
router.post('/rsvp/:eventId', studentAuth, ctrl.rsvp);
router.delete('/rsvp/:eventId', studentAuth, ctrl.cancelRsvp);

module.exports = router;
