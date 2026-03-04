const Booking = require('../models/Booking');
const flightService = require('../services/flightService');
const userService = require('../services/userService');
const paymentService = require('../services/paymentService');
const { generateBookingReference } = require('../utils/helpers');
const { logger } = require('../utils/logger');

exports.createBooking = async (req, res) => {
    try {
        const {
            userId, flightId, seatNumber, passengerName,
            passengerEmail, passengerPhone, specialRequests
        } = req.body;

        logger.info(`Creating booking for user ${userId}, flight ${flightId}`);

        // 1. Validate user with User Service (Student D)
        const userValidation = await userService.validateUser(userId);
        if (!userValidation.valid) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user',
                details: userValidation.error
            });
        }

        // 2. Check flight availability with Flight Service (Student A)
        const availability = await flightService.checkAvailability(flightId);
        if (!availability.available) {
            return res.status(400).json({
                status: 'error',
                message: 'Flight not available or insufficient seats'
            });
        }

        // 3. Calculate fare with Payment Service (Student C)
        const totalAmount = await paymentService.calculateFare(flightId, 1);

        // 4. Process payment with Payment Service (Student C)
        const payment = await paymentService.processPayment({
            userId,
            amount: totalAmount,
            bookingReference: generateBookingReference(),
            paymentMethod: 'credit_card'
        });

        // 5. Create booking in database
        const bookingReference = generateBookingReference();
        const booking = await Booking.create({
            bookingReference,
            userId,
            flightId,
            flightNumber: availability.flight.flightNumber,
            origin: availability.flight.origin,
            destination: availability.flight.destination,
            departureTime: availability.flight.departureTime,
            arrivalTime: availability.flight.arrivalTime,
            seatNumber,
            passengerName,
            passengerEmail,
            passengerPhone,
            totalAmount,
            specialRequests
        });

        // 6. Update booking with payment ID
        await Booking.updateStatus(booking.id, 'confirmed', payment.paymentId);

        logger.info(`✅ Booking created: ${bookingReference}`);

        // 7. Return complete response with data from all services
        res.status(201).json({
            status: 'success',
            message: 'Booking created successfully',
            data: {
                booking: {
                    id: booking.id,
                    reference: booking.booking_reference || booking.bookingReference,
                    status: 'confirmed'
                },
                flight: availability.flight,
                user: userValidation.user,
                payment: payment,
                totalAmount
            }
        });

    } catch (error) {
        logger.error(`Error creating booking: ${error.message}`);

        if (error.service) {
            // Error from another microservice
            res.status(error.status || 503).json({
                status: 'error',
                message: `${error.service} service error`,
                details: error.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Failed to create booking',
                details: error.message
            });
        }
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll();
        res.json({
            status: 'success',
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        logger.error(`Error fetching all bookings: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch bookings'
        });
    }
};

exports.getBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        // Get flight details from Flight Service
        let flightDetails = null;
        try {
            flightDetails = await flightService.getFlightById(booking.flight_id);
        } catch (error) {
            logger.warn('Could not fetch flight details');
        }

        res.json({
            status: 'success',
            data: {
                ...booking,
                flight: flightDetails
            }
        });
    } catch (error) {
        logger.error(`Error fetching booking: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch booking'
        });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const bookings = await Booking.findByUserId(userId);
        
        res.json({
            status: 'success',
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        logger.error(`Error fetching user bookings: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch bookings'
        });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                status: 'error',
                message: 'Booking already cancelled'
            });
        }

        await Booking.updateStatus(id, 'cancelled');

        res.json({
            status: 'success',
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        logger.error(`Error cancelling booking: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Failed to cancel booking'
        });
    }
};