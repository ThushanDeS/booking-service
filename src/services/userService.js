const axios = require('axios');
const { logger } = require('../utils/logger');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

class UserService {
    async getUserById(userId) {
        // If URL is not set, return mock data for testing
        if (!USER_SERVICE_URL || process.env.NODE_ENV === 'test') {
            logger.info('Using mock user service');
            return {
                id: userId,
                name: 'Test User',
                email: 'test@example.com'
            };
        }

        try {
            logger.info(`📡 Calling User Service: GET /users/${userId}`);
            
            const response = await axios.get(
                `${USER_SERVICE_URL}/api/users/${userId}`,
                { timeout: 5000 }
            );
            
            logger.info(`✅ User Service responded: ${response.status}`);
            return response.data;
        } catch (error) {
            logger.error(`❌ User Service error: ${error.message}`);
            
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'User service error',
                    service: 'user'
                };
            } else if (error.request) {
                throw {
                    status: 503,
                    message: 'User service unavailable',
                    service: 'user'
                };
            } else {
                throw {
                    status: 500,
                    message: error.message,
                    service: 'user'
                };
            }
        }
    }

    async validateUser(userId) {
        try {
            const user = await this.getUserById(userId);
            return {
                valid: true,
                user: user
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }
}

module.exports = new UserService();