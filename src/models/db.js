const { Pool } = require('pg');
const { logger } = require('../utils/logger');

let pool;

const connectDB = async () => {
    // only attempt connection if basic env vars are provided
    if (!process.env.DB_HOST || !process.env.DB_NAME) {
        logger.warn('Database environment variables not set; skipping connection');
        return;
    }

    try {
        pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000
        });

        await pool.query('SELECT NOW()');
        logger.info('✅ Connected to PostgreSQL');
        
        await createTables();
        return pool;
    } catch (error) {
        logger.error('❌ Database connection error:', error);
        // don't rethrow to avoid crashing the app; caller can check pool later
    }
};

const createTables = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            booking_reference VARCHAR(10) UNIQUE NOT NULL,
            user_id VARCHAR(50) NOT NULL,
            flight_id VARCHAR(50) NOT NULL,
            flight_number VARCHAR(20),
            origin VARCHAR(10),
            destination VARCHAR(10),
            departure_time TIMESTAMP,
            arrival_time TIMESTAMP,
            seat_number VARCHAR(10) NOT NULL,
            passenger_name VARCHAR(100) NOT NULL,
            passenger_email VARCHAR(100),
            passenger_phone VARCHAR(20),
            total_amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'confirmed',
            payment_id VARCHAR(50),
            payment_status VARCHAR(20) DEFAULT 'pending',
            special_requests TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings(flight_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
    `;

    try {
        await pool.query(query);
        logger.info('✅ Database tables created');
    } catch (error) {
        logger.error('❌ Error creating tables:', error);
        throw error;
    }
};

const getPool = () => {
    if (!pool) throw new Error('Database not connected');
    return pool;
};

module.exports = { connectDB, getPool, closeDB };

// safely close pool for tests or shutdown
async function closeDB() {
    if (pool) {
        await pool.end();
        pool = null;
        logger.info('✅ Database pool closed');
    }
}