require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = async () => {
  // Connect to DB using config/db
  const connect = require('./config/db');
  await connect();
};

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes configuration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exam', require('./routes/exam'));
app.use('/api/submission', require('./routes/submission'));
app.use('/api/incident', require('./routes/incident'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server due to database connection issue:', err.message);
});
