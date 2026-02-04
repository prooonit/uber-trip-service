import redisClient from "../../config/redis.js";
const GEO_KEY = "drivers:geo";

export const storeLocation = async (driverId, lat, lng) => {
  if (lat && lng) {
    await redisClient.geoAdd(GEO_KEY, {
      longitude: lng,
      latitude: lat,
      member: driverId,
    });
  }

  await redisClient.set(`driver:heartbeat:${driverId}`, "1", { EX: 30 });
  const rideId = await redisClient.get(`driver:busy:${driverId}`);
  if (rideId) {
    await redisClient.set(`driver:busy:${driverId}`, rideId, { EX: 60 });
  }
};

export const removeDriver = async (driverId) => {
  await redisClient.zRem(GEO_KEY, driverId);
  await redisClient.del(`driver:heartbeat:${driverId}`);
};

export const findNearbyDrivers = async (lat, lng, radius) => {
  const nearbyDrivers = await redisClient.geoSearch(
    GEO_KEY,
    { longitude: lng, latitude: lat },
    { radius: radius, unit: "km" },
  );

  if (!nearbyDrivers.length) return [];

  // we are using redis pipeline to check heartbeats
  const multi = redisClient.multi();

  nearbyDrivers.forEach((driverId) => {
    multi.exists(`driver:heartbeat:${driverId}`);
    multi.exists(`driver:busy:${driverId}`);
  });

  const results = await multi.exec();

  return nearbyDrivers.filter((_, i) => {
    const heartbeatExists = results[i * 2][1] === 1;
    const busyExists = results[i * 2 + 1][1] === 0; // NOT busy
    return heartbeatExists && busyExists;
  });
};

export const storeNotificationSubscription = async (
  driver_id,
  subscription,
) => {
  await redisClient.set(
    `driver:${driver_id}:webpush`,
    JSON.stringify(subscription),
    { EX: 24 * 60 * 60 }, // 24 hours
  );
};
