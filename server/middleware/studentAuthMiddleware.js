const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const studentAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.studentId) {
      return res.status(401).json({ msg: 'Invalid token type' });
    }

    const student = await Student.findById(decoded.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    req.studentId = student._id;
    req.student = student;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};

module.exports = studentAuthMiddleware;
