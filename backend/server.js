/**
 * BookMyCinema Backend - Main Server Entry Point
 * 
 * Express server configuration with all middleware and routes
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showRoutes = require('./routes/showRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import database connection
const { testConnection } = require('./config/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS - Allow frontend to communicate with backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// API ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BookMyCinema API is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Movie routes
app.use('/api/movies', movieRoutes);

// Show routes (theaters & showtimes)
app.use('/api/shows', showRoutes);

// Seat routes
app.use('/api/seats', seatRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// Payment routes
app.use('/api/payment', paymentRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    console.log('✅ Database connected successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🎬 BookMyCinema Backend Server              ║
║                                               ║
║   Server running on: http://localhost:${PORT}   ║
║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
║                                               ║
║   API Endpoints:                              ║
║   • POST /api/auth/register                   ║
║   • POST /api/auth/login                      ║
║   • GET  /api/movies                          ║
║   • GET  /api/movies/:id                      ║
║   • GET  /api/shows/:movieId                  ║
║   • GET  /api/seats/:showId                   ║
║   • POST /api/seats/book                      ║
║   • POST /api/bookings                        ║
║   • GET  /api/bookings/user/:userId           ║
║   • POST /api/payment                         ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.log('\n⚠️  Make sure MySQL is running and database credentials are correct in .env file');
    process.exit(1);
  }
};

startServer();

module.exports = app;
