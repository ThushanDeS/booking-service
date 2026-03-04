const axios = require('axios');
const { logger } = require('../utils/logger');

const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL;

class FlightService {
    async getFlightById(flightId) {
        // Return mock data for tests
        if (!FLIGHT_SERVICE_URL || process.env.NODE_ENV === 'test') {
            logger.info('Using mock flight service');
            return {
                id: flightId,
                flightNumber: 'AA789',
                airline: 'American Airlines',
                origin: 'JFK',
                destination: 'LAX',
                price: 299.99,
                available_seats: 42
            };
        }

        try {
            logger.info(`📡 Calling Flight Service: GET /api/flights/${flightId}`);
            
            const response = await axios.get(
                `${FLIGHT_SERVICE_URL}/api/flights/${flightId}`,
                { timeout: 5000 }
            );
            
            logger.info(`✅ Flight Service responded: ${response.status}`);
            return response.data.data;
        } catch (error) {
            logger.error(`❌ Flight Service error: ${error.message}`);
            
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Flight service error',
                    service: 'flight'
                };
            } else if (error.request) {
                throw {
                    status: 503,
                    message: 'Flight service unavailable',
                    service: 'flight'
                };
            } else {
                throw {
                    status: 500,
                    message: error.message,
                    service: 'flight'
                };
            }
        }
    }

    async checkAvailability(flightId, seatsNeeded = 1) {
        try {
            const flight = await this.getFlightById(flightId);
            
            return {
                available: flight.available_seats >= seatsNeeded,
                flight: flight,
                availableSeats: flight.available_seats
            };
        } catch (error) {
            logger.error(`Error checking availability: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new FlightService();