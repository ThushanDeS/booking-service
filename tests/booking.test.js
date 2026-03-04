// tests/booking.test.js
// ensure database connection is skipped during tests
process.env.NODE_ENV = 'test';
process.env.DB_HOST = '';

const request = require('supertest');
const app = require('../src/app');
const Booking = require('../src/models/Booking');

beforeEach(() => {
    Booking._resetTestStore();
});

describe('Booking Service Unit Tests', () => {
    
    test('GET /health should return 200', async () => {
        const response = await request(app).get('/health');
        expect(response.statusCode).toBe(200);
        expect(response.body.service).toBe('booking-service');
    });

    test('GET / should return service info', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body.service).toBe('Booking Service');
    });

    test('GET /api/bookings should return array', async () => {
        const response = await request(app).get('/api/bookings');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});