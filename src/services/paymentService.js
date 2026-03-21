const axios = require('axios');
const { logger } = require('../utils/logger');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL;

class PaymentService {
    async calculateFare(flightId, passengers = 1) {
        try {
            logger.info(`📡 Calling Payment Service: GET /api/fares/${flightId}?passengers=${passengers}`);
            
            const response = await axios.get(
                `${PAYMENT_SERVICE_URL}/api/fares/${flightId}`,
                { 
                    params: { passengers },
                    timeout: 5000 
                }
            );
            
            logger.info(`✅ Payment Service responded: ${response.status}`);
            
            // Return the total price from the response
            return response.data.total_price;
        } catch (error) {
            logger.error(`Error calculating fare: ${error.message}`);
            
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

    async processPayment(paymentData) {
        try {
            logger.info(`📡 Calling Payment Service: POST /api/payments`);
            
            const response = await axios.post(
                `${PAYMENT_SERVICE_URL}/api/payments`,
                paymentData,
                { timeout: 5000 }
            );
            
            logger.info(`✅ Payment Service responded: ${response.status}`);
            return response.data;
        } catch (error) {
            logger.error(`Error processing payment: ${error.message}`);
            
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
}

module.exports = new PaymentService();