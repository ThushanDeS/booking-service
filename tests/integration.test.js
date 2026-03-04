// tests/integration.test.js

const BOOKING_SERVICE = 'http://localhost:5002';
const FLIGHT_SERVICE = 'http://localhost:5001';
const USER_SERVICE = 'http://localhost:5004';
const PAYMENT_SERVICE = 'http://localhost:5003';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function logSuccess(msg) { console.log(`${colors.green}✅ ${msg}${colors.reset}`); }
function logError(msg) { console.log(`${colors.red}❌ ${msg}${colors.reset}`); }
function logInfo(msg) { console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`); }
function logHeader(msg) { console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}`); }

// prevent real DB connection and external service vars during test run
process.env.NODE_ENV = 'test';
process.env.DB_HOST = '';

// disable axios keepAlive agents to avoid circular structure errors in jest
const http = require('http');
const https = require('https');
const axios = require('axios');
axios.defaults.httpAgent = new http.Agent({ keepAlive: false });
axios.defaults.httpsAgent = new https.Agent({ keepAlive: false });

let server;

describe('Booking Service Integration Tests', () => {
    const Booking = require('../src/models/Booking');

    beforeAll(done => {
        // ensure Jest waits longer for server to bind if the port lingers
        jest.setTimeout(20000);
        process.env.PORT = 5002;
        const app = require('../src/app');
        server = app.listen(process.env.PORT, err => {
            if (err) {
                return done(err);
            }
            console.log('Test server started on port', process.env.PORT);
            done();
        });
    });

    afterAll(done => {
        if (server) server.close(done);
        else done();
    });

    beforeEach(() => {
        Booking._resetTestStore();
    });
    
    test('Booking Service health check', async () => {
        const response = await axios.get(`${BOOKING_SERVICE}/health`);
        expect(response.status).toBe(200);
        expect(response.data.service).toBe('booking-service');
        expect(response.data.status).toBe('healthy');
    });

    test('Flight Service integration (optional)', async () => {
        try {
            const response = await axios.get(`${FLIGHT_SERVICE}/api/flights/FL001`);
            expect(response.status).toBe(200);
            expect(response.data.data).toBeDefined();
            expect(response.data.data.flightNumber).toBeDefined();
            logSuccess('Flight Service integration working');
        } catch (error) {
            logError('Flight Service not available, skipping');
            // don't fail the suite if external service is down
        }
    });

    test('Create booking with valid data', async () => {
        const bookingData = {
            userId: "USR001",
            flightId: "FL001",
            seatNumber: "12A",
            passengerName: "John Doe",
            passengerEmail: "john@example.com"
        };

        try {
            const response = await axios.post(`${BOOKING_SERVICE}/api/bookings`, bookingData);
            expect(response.status).toBe(201);
            expect(response.data.status).toBe('success');
            expect(response.data.data.booking.reference).toBeDefined();
            logSuccess('Booking created successfully');
        } catch (error) {
            let msg = (error && error.message) ? error.message : String(error);
            if (error && error.code === 'ECONNREFUSED') {
                logError('Booking Service not running');
            } else {
                logError(`Booking creation failed: ${msg}`);
            }
            // throw simple error message (no circular object)
            throw new Error(msg);
        }
    });
});