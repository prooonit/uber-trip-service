import { Worker } from "bullmq";
import redisClient from "../config/redis.js";          // node-redis
import bullRedis from "../config/bullmq.redis.js";     // ioredis
import { notifyDriver } from "../modules/ride/ride.notification.js";

const FANOUT = 3;
const BUSY_TTL = 10;
const MAX_WAVES = 3;

new Worker(
  "ride-matching",
  async (job) => {
    const { rideId, pickup, drop } = job.data;

    // stop if already assigned
    if (await redisClient.exists(`ride:${rideId}:assigned`)) return;

    const wave = Number(await redisClient.get(`ride:${rideId}:wave`));

    if (wave >= MAX_WAVES) {
      await redisClient.set(`ride:${rideId}:status`, "FAILED", { EX: 30 });
      return;
    }

    const drivers = await redisClient.lPop(
      `ride:${rideId}:queue`,
      FANOUT
    );

    if (!drivers || drivers.length === 0) {
      await redisClient.set(`ride:${rideId}:status`, "FAILED", { EX: 30 });
      return;
    }

    for (const driverId of drivers) {
      const locked = await redisClient.set(
        `driver:${driverId}:busy`,
        rideId,
        { NX: true, EX: BUSY_TTL }
      );

      if (locked) {
        await notifyDriver(driverId, {
          rideId,
          pickup,
          drop,
          expiresIn: BUSY_TTL
        });
      }
    }

    await redisClient.incr(`ride:${rideId}:wave`);

    // schedule next wave
    await job.queue.add(
      "MATCH_WAVE",
      { rideId, pickup, drop },
      { delay: BUSY_TTL * 1000, removeOnComplete: true }
    );
  },
  {
    connection: bullRedis,  
    concurrency: 5
  }
);
  