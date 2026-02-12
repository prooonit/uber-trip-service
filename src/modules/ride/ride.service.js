import redisClient from "../../config/redis.js";
import { v4 as uuidv4 } from "uuid";
import { findNearbyDrivers } from "../driver/driver.service.js";
import {rideMatchingQueue} from "../../queues/rideMatching.queue.js";


const MAX_QUEUE_TTL = 120;

export const confirmRideService = async ({ userId, pickup, drop }) => {
  const rideId = uuidv4();
   console.log(rideId);
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
    nearbyDrivers
  );

  await redisClient.set(`ride:${rideId}:status`, "PENDING", {
    EX: MAX_QUEUE_TTL,
  });
  await redisClient.set(`ride:${rideId}:wave`, 0);

  await rideMatchingQueue.add(
    "MATCH_WAVE",
    { rideId, pickup, drop },
    { removeOnComplete: true }
  );

  return {
    status: "PENDING",
    rideId,
    message: "Finding nearby drivers",
  };
};
export const acceptRideService = async ({driverId, rideId})=>{
  const lock = await redisClient.set(`ride:${rideId}:lock`, driverId, {
    NX: true,
    EX: 30,
  });
  if (!lock) {
    return {success: false, message: "Ride already accepted by another driver"};
  }

  await redisClient.set(`ride:${rideId}:assigned`, driverId);
  await redisClient.set(`ride:${rideId}:status`, "ASSIGNED");

// driver accepts ride
   await redisClient.set(`driver:busy:${driverId}`,rideId,{ EX: 60 });
   return { success: true,message: "Ride accepted",rideId,driverId,};  
}

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
    driverId
  };
};
