const axios = require('axios');
const { logger } = require('../utils/logger');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL;

class PaymentService {
    async processPayment(paymentData) {
        // Return mock data for tests
        if (!PAYMENT_SERVICE_URL || process.env.NODE_ENV === 'test') {
            logger.info('Using mock payment service');
            return {
                paymentId: 'PAY' + Date.now(),
                status: 'success',
                transactionId: 'TXN' + Math.random().toString(36).substring(7)
            };
        }

        try {
            logger.info(`📡 Calling Payment Service: POST /payments`);
            
            const response = await axios.post(
                `${PAYMENT_SERVICE_URL}/payments`,
                paymentData,
                { timeout: 5000 }
            );
            
            logger.info(`✅ Payment Service responded: ${response.status}`);
            return response.data;
        } catch (error) {
            logger.error(`❌ Payment Service error: ${error.message}`);
            
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Payment service error',
                    service: 'payment'
                };
            } else if (error.request) {
                throw {
                    status: 503,
                    message: 'Payment service unavailable',
                    service: 'payment'
                };
            } else {
                throw {
                    status: 500,
                    message: error.message,
                    service: 'payment'
                };
            }
        }
    }

    async calculateFare(flightId, passengers) {
        // Return mock fare for tests
        if (!PAYMENT_SERVICE_URL || process.env.NODE_ENV === 'test') {
            return 299.99 * passengers;
        }

        try {
            logger.info(`📡 Calling Payment Service: GET /fares/${flightId}`);
            
            const response = await axios.get(
                `${PAYMENT_SERVICE_URL}/fares/${flightId}`,
                { timeout: 5000 }
            );
            
            const fare = response.data;
            return fare.price * passengers;
        } catch (error) {
            logger.error(`Error calculating fare: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new PaymentService();