const redisClient = require("../../config/redis");
const { v4: uuidv4 } = require("uuid");
const { findNearbyDrivers } = require("../driver/driver.service");
const rideMatchingQueue = require("../../queues/rideMatching.queue");



const MAX_QUEUE_TTL = 120;


exports.confirmRideService = async ({ userId, pickup, drop }) => {
  const rideId = uuidv4();

  
  const nearbyDrivers = await findNearbyDrivers(
    pickup.lat,
    pickup.lng,
    5
  );

  if (!nearbyDrivers.length) {
    return { status: "NO_DRIVERS_AVAILABLE" };
  }

  
  await redisClient.rPush(
    `ride:${rideId}:queue`,
    nearbyDrivers.map(d => d.driverId)
  );

  
  await redisClient.set(`ride:${rideId}:status`, "PENDING", { EX: MAX_QUEUE_TTL });
  await redisClient.set(`ride:${rideId}:wave`, 0);

  
  await rideMatchingQueue.add(
    "MATCH_WAVE",
    { rideId, pickup, drop },
    { removeOnComplete: true }
  );

  return {
    status: "PENDING",
    rideId,
    message: "Finding nearby drivers"
  };
};
