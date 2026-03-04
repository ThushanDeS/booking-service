const Joi = require('joi');

const bookingSchema = Joi.object({
    userId: Joi.string().required(),
    flightId: Joi.string().required(),
    seatNumber: Joi.string().pattern(/^[0-9]{1,2}[A-Z]$/).required(),
    passengerName: Joi.string().min(2).max(100).required(),
    passengerEmail: Joi.string().email(),
    passengerPhone: Joi.string().pattern(/^[0-9+\-\s]+$/),
    specialRequests: Joi.string().max(500)
});

exports.validateBooking = (req, res, next) => {
    const { error } = bookingSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            details: error.details.map(d => d.message)
        });
    }
    
    next();
};