const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const connectDB = require('./config/db');
const { HTTP_STATUS } = require('./config/constants');

// Load environment variables
dotenv.config();

// Connect to Database if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
app.disable('x-powered-by');

// Security and Efficiency Middlewares
app.use(cors());
app.use(compression());
app.use(mongoSanitize());

// Increase limits to allow base64 images to be uploaded
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * @middleware inputLengthValidator
 * @desc Checks if text input content exceeds safety thresholds
 * @access Public
 */
const MAX_INPUT_LENGTH = 1000;
app.use((req, res, next) => {
  if (req.body && req.body.content?.length > MAX_INPUT_LENGTH) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Input too long' });
  }
  next();
});

// Route Mountings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/calculator', require('./routes/calculatorRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

/**
 * @route GET /
 * @desc API Root Health Check
 * @access Public
 */
app.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: 'healthy', message: 'Welcome to EcoTrack AI API Server!' });
});

/**
 * @middleware errorHandler
 * @desc Catches all errors and returns standardized JSON error responses
 * @access Public
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(HTTP_STATUS.SERVER_ERROR).json({ 
    error: 'Internal server error',
    requestId: Date.now()
  });
});

const PORT = process.env.PORT || 5000;

// Only start listening if not running in test runner environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app; // Export app for integration tests
