const redisClient = require("../../config/redis");

const GEO_KEY = "drivers:geo";

exports.storeLocation = async (driverId, lat, lng) => {
  await redisClient.geoAdd(GEO_KEY, {
    longitude: lng,
    latitude: lat,
    member: driverId
  });

  await redis.set(
  `driver:heartbeat:${driverId}`,1,{ EX: 30 } );
};

exports.removeDriver = async (driverId) => {
  await  redis.del(`driver:heartbeat:${driverId}`);
};

exports.findNearbyDrivers = async (lat, lng, radius) => {
  const nearbyDrivers = await redis.geoRadius(
  GEO_KEY,lng,lat,radius,'km'
  );
  if(!nearbyDrivers.length)return [];
  
  const pipeline = redis.pipeline();
  nearbyDrivers.forEach(driverId => {
    pipeline.exists(`driver:heartbeat:${driverId}`);
  });
  const results = await pipeline.exec();
  const activeDrivers = [];
  for(let i = 0; i < nearbyDrivers.length; i++){
    if(results[i][1] === 1){
      activeDrivers.push(nearbyDrivers[i]);
    }
  }

  return activeDrivers;
}