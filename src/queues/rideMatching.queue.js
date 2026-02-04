import { Queue } from "bullmq";
import bullRedis from "../config/bullmq.redis.js";

export const rideMatchingQueue = new Queue("ride-matching", {
  connection: bullRedis
});

