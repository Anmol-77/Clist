// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const contestRoutes = require('./routes.js');
const { setupContestUpdater } = require('./scheduleJobs.js');

const dotenv=require("dotenv");
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Start contest updater job
    setupContestUpdater();
  })
  .catch((error) => {
    console.error('Detailed MongoDB connection error:', error);
    process.exit(1);
  });

// Add these event listeners for more debugging info
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.use('/api/contests', contestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
