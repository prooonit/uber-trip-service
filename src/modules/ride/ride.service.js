import redisClient from "../../config/redis.js";
import { v4 as uuidv4 } from "uuid";
import { findNearbyDrivers } from "../driver/driver.service.js";
import { rideMatchingQueue } from "../../queues/rideMatching.queue.js";

const MAX_QUEUE_TTL = 120;


export const confirmRideService = async ({ userId, pickup, drop }) => {

  const existingRide = await redisClient.get(`user:activeRide:${userId}`);
  if (existingRide) {
    return {
      success: false,
      status: "ALREADY_HAS_ACTIVE_RIDE",
      rideId: existingRide,
    };
  }

  const rideId = uuidv4();

  await redisClient.set(`ride:${rideId}:user`, userId);
  await redisClient.set(`user:activeRide:${userId}`, rideId, {
    EX: MAX_QUEUE_TTL,
  });
 //await redisClient.set(`ride:${rideId}:user`, userId);
  const nearbyDrivers = await findNearbyDrivers(pickup.lat, pickup.lng, 5);

  if (!nearbyDrivers.length) {
    return { status: "NO_DRIVERS_AVAILABLE" };
  }

  await redisClient.rPush(`ride:${rideId}:queue`, nearbyDrivers);

  await redisClient.set(`ride:${rideId}:status`, "PENDING", {
    EX: MAX_QUEUE_TTL,
  });
  await redisClient.set(`ride:${rideId}:wave`, 0);

  await rideMatchingQueue.add(
    "MATCH_WAVE",
    { rideId, pickup, drop },
    { removeOnComplete: true },
  );

  return {
    status: "PENDING",
    rideId,
    message: "Finding nearby drivers",
  };
};

export const acceptRideService = async ({ driverId, rideId }) => {
  const ride = redisClient.get(`driver:busy:${driverId}`);
  if (ride !== rideId) {
    return { success: false, message: "Ride not found in driver's busy list" };
  }
  const lock = await redisClient.set(`ride:${rideId}:lock`, driverId, {
    NX: true,
    EX: 30,
  });
  if (!lock) {
    return {
      success: false,
      message: "Ride already accepted by another driver",
    };
  }

  await redisClient.set(`ride:${rideId}:assigned`, driverId);
  await redisClient.set(`ride:${rideId}:status`, "ASSIGNED");
  const userId = await redisClient.get(`ride:${rideId}:user`);
  await redisClient.set(`user:activeRide:${userId}`, rideId);

  // driver accepts ride
  await redisClient.set(`driver:busy:${driverId}`, rideId, { EX: 60 });
  return { success: true, message: "Ride accepted", rideId, driverId };
};

export const rejectRideService = async ({ driverId, rideId }) => {
  const busyRide = await redisClient.get(`driver:${driverId}:busy`);

  // Only remove if busy is for this ride
  if (busyRide === rideId) {
    await redisClient.del(`driver:${driverId}:busy`);
  }
  return {
    success: true,
    message: "Ride rejected",
    rideId,
    driverId,
  };
};

export const startRideService = async ({ driverId, rideId }) => {
  const assignedDriver = await redisClient.get(`ride:${rideId}:assigned`);

  if (assignedDriver !== driverId) {
    return { success: false, message: "You are not assigned to this ride" };
  }
  const status = await redisClient.get(`ride:${rideId}:status`);

  if (status !== "ASSIGNED") {
    return { success: false, message: "Ride is not in ASSIGNED state" };
  }
  await redisClient.set(`ride:${rideId}:status`, "ONGOING");

  return { success: true, message: "Ride started", rideId, driverId };
};

export const completeRideService = async ({ driverId, rideId }) => {
  const assignedDriver = await redisClient.get(`ride:${rideId}:assigned`);

  if (assignedDriver !== driverId) {
    return { success: false, message: "You are not assigned to this ride" };
  }
  const status = await redisClient.get(`ride:${rideId}:status`);
  if (status === "COMPLETED") {
    return { success: false, message: "Ride is already completed" };
  }

  if (status !== "ONGOING") {
    return { success: false, message: "Ride is not in ONGOING state" };
  }

  await redisClient.set(`ride:${rideId}:status`, "COMPLETED");
  await redisClient.expire(`ride:${rideId}:status`, 3600);

  await redisClient.del(`driver:busy:${driverId}`);

  await redisClient.del(`ride:${rideId}:lock`);

  return { success: true, message: "Ride completed", rideId, driverId };
};



export const cancelRideService = async (userId) => {

  const rideId = await redisClient.get(`user:activeRide:${userId}`);
  if (!rideId) {
    return { success: false, message: "No active ride to cancel" };
  }
  const status = await redisClient.get(`ride:${rideId}:status`);

  if (status === "COMPLETED") {
    return { success: false, message: "Cannot cancel a completed ride" };
  }
  if (status === "ONGOING") {
    return { success: false, message: "Cannot cancel an ongoing ride, please talk to driver" };
  }
  if (status === "CANCELLED") {
    return { success: false, message: "Ride is already cancelled" };
  }
  await redisClient.set(`ride:${rideId}:status`, "CANCELLED");
  await redisClient.expire(`ride:${rideId}:status`, 3600);
  const assignedDriver = await redisClient.get(`ride:${rideId}:assigned`);
  if (assignedDriver) {
    await redisClient.del(`driver:busy:${assignedDriver}`);
    await redisClient.del(`ride:${rideId}:lock`);
  }
  await redisClient.del(`ride:${rideId}:queue`);
  await redisClient.del(`ride:${rideId}:wave`);
  await redisClient.del(`user:activeRide:${userId}`);

  return { success: true, message: "Ride cancelled", rideId };
}


export const rideStatusService = async (userId) => {
  const rideId = await redisClient.get(`user:activeRide:${userId}`);   
  if (!rideId) {
    return { success: false, message: "No active ride" };
  }
  const status = await redisClient.get(`ride:${rideId}:status`);
  if (!status) {
    return { success: false, message: "Ride not found" };
  }
  return { success: true, rideId, status };
}