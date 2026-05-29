const Student = require('../models/Student');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const { sendRsvpConfirmation } = require('../utils/sendMail');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

const signToken = (student) =>
  jwt.sign({ studentId: student._id, email: student.email }, JWT_SECRET, { expiresIn: '7d' });

const sanitize = (student) => ({
  _id: student._id,
  name: student.name,
  email: student.email,
});

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  try {
    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ msg: 'An account with this email already exists' });
    }

    const student = await Student.create({ name, email, password });
    const token = signToken(student);
    res.status(201).json({ token, student: sanitize(student) });
  } catch (err) {
    console.error('Student register error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  try {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }
    const match = await student.comparePassword(password);
    if (!match) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }
    const token = signToken(student);
    res.json({ token, student: sanitize(student) });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  res.json({ student: sanitize(req.student) });
};

exports.rsvp = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    const alreadyRegistered = event.registeredUsers.some(
      (u) => u.studentId && u.studentId.toString() === req.studentId.toString()
    );
    if (alreadyRegistered) {
      return res.status(400).json({ msg: 'You are already registered for this event' });
    }

    if (event.capacity != null && event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ msg: 'This event is full' });
    }

    event.registeredUsers.push({
      studentId: req.studentId,
      name: req.student.name,
      email: req.student.email,
    });
    await event.save();

    if (!req.student.registeredEvents.some((id) => id.toString() === eventId)) {
      req.student.registeredEvents.push(eventId);
      await req.student.save();
    }

    // Fire-and-forget confirmation email (don't block the response on it)
    sendRsvpConfirmation({
      studentName: req.student.name,
      studentEmail: req.student.email,
      event,
    }).catch((err) => console.error('RSVP confirmation email failed:', err.message));

    res.json({ msg: 'Registered successfully', eventId });
  } catch (err) {
    console.error('RSVP error:', err);
    res.status(500).json({ msg: 'Server error during RSVP' });
  }
};

exports.cancelRsvp = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    event.registeredUsers = event.registeredUsers.filter(
      (u) => !(u.studentId && u.studentId.toString() === req.studentId.toString())
    );
    await event.save();

    req.student.registeredEvents = req.student.registeredEvents.filter(
      (id) => id.toString() !== eventId
    );
    await req.student.save();

    res.json({ msg: 'Registration cancelled', eventId });
  } catch (err) {
    console.error('Cancel RSVP error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.myEvents = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).populate({
      path: 'registeredEvents',
      options: { sort: { date: 1 } },
    });
    res.json(student.registeredEvents || []);
  } catch (err) {
    console.error('My events error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.checkRegistration = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findById(eventId).select('registeredUsers');
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    const registered = event.registeredUsers.some(
      (u) => u.studentId && u.studentId.toString() === req.studentId.toString()
    );
    res.json({ registered });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
