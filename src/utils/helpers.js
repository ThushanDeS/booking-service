const { v4: uuidv4 } = require('uuid');

const generateBookingReference = () => {
    return 'BKG' + uuidv4().substring(0, 8).toUpperCase();
};

const formatDate = (date) => {
    return new Date(date).toISOString();
};

module.exports = {
    generateBookingReference,
    formatDate
};