const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const animalRoutes = require('./routes/animals');
const eventRoutes = require('./routes/events');
const notificationRoutes = require('./routes/notifications');
const healthReportRoutes = require('./routes/healthReports');
const userRoutes = require('./routes/users');
const systemRoutes = require('./routes/system');
const uploadRoutes = require('./routes/uploads');

// Import database initialization
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Static files for uploaded images
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health-reports', healthReportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: 'The requested resource was not found on this server.',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'Database Constraint Error',
      message: 'The operation violates database constraints.'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token.'
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔧 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 ZooQuest Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      console.log(`📁 Upload directory: ./uploads`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
