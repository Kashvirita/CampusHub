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


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/events', eventRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', imageuploadRoutes);
app.use('/api/students', studentRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startReminderScheduler();
});
