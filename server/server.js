const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const imageuploadRoutes = require('./routes/Image');
const studentRoutes = require('./routes/students');
const { startReminderScheduler } = require('./utils/reminderScheduler');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://campushub-04om.onrender.com'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser()); 


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/events', eventRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', imageuploadRoutes);
app.use('/api/students', studentRoutes);

// Connect to MongoDB first, retry on failure, then start the HTTP server.
const PORT = process.env.PORT || 5000;

const connectWithRetry = async (attempt = 1) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // prefer IPv4 to avoid flaky AAAA lookups on some networks
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    const delay = Math.min(30000, 2000 * attempt);
    console.error(`❌ MongoDB connection error (attempt ${attempt}):`, err.message);
    console.log(`↻ Retrying in ${delay / 1000}s…`);
    setTimeout(() => connectWithRetry(attempt + 1), delay);
  }
};

(async () => {
  await connectWithRetry();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startReminderScheduler();
  });
})();
