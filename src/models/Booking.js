const { getPool } = require('./db');
const { logger } = require('../utils/logger');

// In test mode we use an in-memory store to avoid connecting to a real database
const isTest = process.env.NODE_ENV === 'test';
const testStore = [];

class Booking {
    // for tests only
    static _resetTestStore() {
        if (isTest) testStore.length = 0;
    }
    static async create(bookingData) {
        if (isTest) {
            const booking = { id: testStore.length + 1, ...bookingData };
            // mimic database naming conventions for the response
            if (booking.bookingReference !== undefined) {
                booking.booking_reference = booking.bookingReference;
            }
            testStore.push(booking);
            return booking;
        }

        const pool = getPool();
        const query = `
            INSERT INTO bookings (
                booking_reference, user_id, flight_id, flight_number,
                origin, destination, departure_time, arrival_time,
                seat_number, passenger_name, passenger_email, passenger_phone,
                total_amount, special_requests
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const values = [
            bookingData.bookingReference,
            bookingData.userId,
            bookingData.flightId,
            bookingData.flightNumber,
            bookingData.origin,
            bookingData.destination,
            bookingData.departureTime,
            bookingData.arrivalTime,
            bookingData.seatNumber,
            bookingData.passengerName,
            bookingData.passengerEmail,
            bookingData.passengerPhone,
            bookingData.totalAmount,
            bookingData.specialRequests
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error(`Error creating booking: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    static async findById(id) {
        if (isTest) {
            return testStore.find(b => b.id == id || b.booking_reference == id);
        }

        const pool = getPool();
        const query = 'SELECT * FROM bookings WHERE id = $1 OR booking_reference = $1';
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            logger.error(`Error finding booking: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    static async findByUserId(userId) {
        if (isTest) {
            return testStore.filter(b => b.user_id == userId);
        }

        const pool = getPool();
        const query = 'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC';
        
        try {
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            logger.error(`Error finding user bookings: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    static async findAll() {
        if (isTest) {
            return testStore.slice();
        }
        const pool = getPool();
        const query = 'SELECT * FROM bookings ORDER BY created_at DESC';
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            logger.error(`Error fetching all bookings: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    static async updateStatus(id, status, paymentId = null) {
        if (isTest) {
            const b = await this.findById(id);
            if (!b) return null;
            b.status = status;
            if (paymentId) b.payment_id = paymentId;
            return b;
        }

        const pool = getPool();
        const query = `
            UPDATE bookings 
            SET status = $1, payment_id = COALESCE($2, payment_id), updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 OR booking_reference = $3
            RETURNING *
        `;

        try {
            const result = await pool.query(query, [status, paymentId, id]);
            return result.rows[0];
        } catch (error) {
            logger.error(`Error updating booking status: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
}

module.exports = Booking;