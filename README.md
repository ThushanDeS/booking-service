# Booking Service ✈️

## Student B - Booking Microservice

This microservice handles flight bookings and integrates with all other services.

## Features
- Create new bookings
- View booking details
- Cancel bookings
- View user booking history
- Integration with Flight, User, and Payment services

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get booking by ID |
| GET | `/api/bookings/user/:userId` | Get user's bookings |
| POST | `/api/bookings` | Create new booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |

## Integration Points
This service calls:
- **Flight Service** (Student A): To check flight availability
- **User Service** (Student D): To verify passenger
- **Payment Service** (Student C): To process payment

## Setup Instructions
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Run locally: `npm run dev`
4. Run tests: `npm test`

## Docker
```bash
# Build image
docker build -t booking-service .

# Run container
docker run -p 5002:5002 booking-service

# Run with docker-compose
docker-compose up