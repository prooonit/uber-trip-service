const redisClient = require("../../config/redis");

const GEO_KEY = "drivers:geo";

exports.storeLocation = async (driverId, lat, lng) => {
  if (lat && lng) {
    await redisClient.geoAdd(GEO_KEY, {
      longitude: lng,
      latitude: lat,
      member: driverId,
    });
  }

  await redisClient.set(`driver:heartbeat:${driverId}`, "1", { EX: 30 });
};

exports.removeDriver = async (driverId) => {
  await redisClient.zRem(GEO_KEY, driverId);
  await redisClient.del(`driver:heartbeat:${driverId}`);
};

exports.findNearbyDrivers = async (lat, lng, radius) => {
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
  });

  const results = await multi.exec();

  return nearbyDrivers.filter((_, i) => results[i][1] === 1);
};
