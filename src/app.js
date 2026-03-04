const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bookingRoutes = require('./routes/bookingRoutes');
const { logger } = require('./utils/logger');
const { connectDB } = require('./models/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Database connection (skip while running unit tests)
if (process.env.NODE_ENV !== 'test') {
    connectDB()
        .then(() => {
            // db connected or skipped
        })
        .catch(err => {
            // error is already logged in connectDB; avoid unhandled rejection
            logger.warn('Proceeding without database connection');
        });
} else {
    logger.info('Test environment: not connecting to database');
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: 'booking-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        dependencies: {
            flight: process.env.FLIGHT_SERVICE_URL,
            user: process.env.USER_SERVICE_URL,
            payment: process.env.PAYMENT_SERVICE_URL
        }
    });
});

// Routes
app.use('/api/bookings', bookingRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Booking Service',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            bookings: 'GET /api/bookings',
            createBooking: 'POST /api/bookings',
            getBooking: 'GET /api/bookings/:id',
            userBookings: 'GET /api/bookings/user/:userId',
            cancelBooking: 'PATCH /api/bookings/:id/cancel'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});

// only start server when the file is run directly (not when required by tests)
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`=================================`);
        logger.info(`🚀 Booking Service Starting...`);
        logger.info(`=================================`);
        logger.info(`📡 Port: ${PORT}`);
        logger.info(`🔧 Environment: ${process.env.NODE_ENV}`);
        logger.info(`=================================`);
    });
}

module.exports = app;