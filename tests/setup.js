// tests/setup.js
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock external services
jest.mock('../src/services/userService', () => ({
    getUserById: jest.fn().mockResolvedValue({
        id: 'USR001',
        name: 'Test User',
        email: 'test@example.com'
    }),
    validateUser: jest.fn().mockResolvedValue({
        valid: true,
        user: {
            id: 'USR001',
            name: 'Test User',
            email: 'test@example.com'
        }
    })
}));

jest.mock('../src/services/flightService', () => ({
    getFlightById: jest.fn().mockResolvedValue({
        id: 'FL001',
        flightNumber: 'AA789',
        airline: 'American Airlines',
        origin: 'JFK',
        destination: 'LAX',
        price: 299.99,
        available_seats: 42
    }),
    checkAvailability: jest.fn().mockResolvedValue({
        available: true,
        flight: {
            id: 'FL001',
            flightNumber: 'AA789',
            origin: 'JFK',
            destination: 'LAX',
            price: 299.99,
            available_seats: 42
        }
    })
}));

jest.mock('../src/services/paymentService', () => ({
    processPayment: jest.fn().mockResolvedValue({
        paymentId: 'PAY123',
        status: 'success'
    }),
    calculateFare: jest.fn().mockResolvedValue(299.99)
}));