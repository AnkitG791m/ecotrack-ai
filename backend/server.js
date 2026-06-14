const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');
const { HTTP_STATUS, RATE_LIMIT } = require('./config/constants');
const { errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

// Connect to Database if not in test environment
if (env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Request logger middleware via Winston
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// XSS Protection
app.use(xss());

// Configure CORS
const allowedOrigins = env.FRONTEND_URL
  ? [env.FRONTEND_URL]
  : (env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173']);

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Allow localhost fallback for testing
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(compression());
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Request Body Limits
// Parse larger JSON only for image analysis/bill scanning routes
app.use('/api/ai/analyze-image', express.json({ limit: '10mb' }));
app.use('/api/ai/scan-bill', express.json({ limit: '10mb' }));

// Global limits for all other routes
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));

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

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route Mountings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/calculator', require('./routes/calculatorRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

/**
 * @route GET /
 * @desc API Root Health Check
 * @access Public
 */
app.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: 'healthy', message: 'Welcome to EcoTrack AI API Server!' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

// Only start listening if not running in test runner environment
if (env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app; // Export app for integration tests
