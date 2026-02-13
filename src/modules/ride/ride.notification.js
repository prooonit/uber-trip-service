import redisClient from "../../config/redis.js";
import webPush from "../../config/webpush.js";


export const notifyDriver = async (driverId, payload) => {
  try {
    const subscriptionData = await redisClient.get(
      `driver:${driverId}:webpush`
    );

    if (!subscriptionData) {
      console.log(`No subscription for driver ${driverId}`);
      return;
    }

    const subscription = JSON.parse(subscriptionData);

    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        type: "RIDE_REQUEST",
        driverId,
        ...payload
      })
    );

    console.log(`✅ Push sent to driver ${driverId}`);
  } catch (error) {
    console.error("Push error:", error.message);

    // remove expired subscription
    if (error.statusCode === 410 || error.statusCode === 404) {
      await redisClient.del(`driver:${driverId}:webpush`);
      console.log(`🗑 Removed expired subscription for ${driverId}`);
    }
  }
};
