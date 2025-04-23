// const jwt = require('jsonwebtoken');
// const Committee = require('../models/Committee');

// const authMiddleware = async (req, res, next) => {
//   const token = req.cookies?.token;

//   if (!token) {
//     return res.status(403).json({ message: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.committeeId = decoded.id;

//     const committee = await Committee.findById(req.committeeId);
//     if (!committee) {
//       return res.status(404).json({ message: 'Committee not found' });
//     }

//     req.committee = committee;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const Committee = require('../models/Committee');

const authMiddleware = async (req, res, next) => {
  // Log request headers for debugging
  // console.log('Authorization Headers:', req.headers);

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.error('No authorization header provided');
    return res.status(403).json({ message: 'No token provided' });
  }

  // Bearer <token>
  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    console.error('Token missing from authorization header');
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded token:', decoded);

    req.committeeId = decoded.committeeId;

    const committee = await Committee.findById(req.committeeId);
    if (!committee) {
      console.error('Committee not found for ID:', req.committeeId);
      return res.status(404).json({ message: 'Committee not found' });
    }

    req.committee = committee;
    next();
  } catch (error) {
    console.error('Error during token verification:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;