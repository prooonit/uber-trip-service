const {Queue}= require('bullmq');
const redisClient = require('../config/redis');

const rideMatchingQueue = new Queue('ride-matching', {
    connection: {redisClient}
});

module.exports = rideMatchingQueue;