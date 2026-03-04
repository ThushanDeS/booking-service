const { v4: uuidv4 } = require('uuid');

const generateBookingReference = () => {
    // Simple, short reference: BKG + timestamp (6 digits) + random letter
    const timestamp = Date.now().toString().slice(-6);
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `BKG${timestamp}${randomLetter}`;  // Example: BKG123456A (10 chars)
};

const formatDate = (date) => {
    return new Date(date).toISOString();
};

module.exports = {
    generateBookingReference,
    formatDate
};