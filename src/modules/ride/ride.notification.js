const redisClient = require('../../config/redis');
const webpush = require('../../config/webpush');

exports.notifyDriver = async (driverId, payload) => {
    try{
        const address = await redisClient.get(`driver:${driverId}:webpush`);
        if(!address) {
            console.log(`No subscription found for driver ${driverId}`);
            return;
        }
        const subscription = JSON.parse(address);
        const pushpayload = JSON.stringify({
            type: "RIDE_REQUEST",
            rideId: payload.rideId,
            pickup: payload.pickup,
            drop: payload.drop,
            expiresIn: payload.expiresIn,
        });
        await webpush.sendNotification(subscription, pushpayload);
        console.log(`Notification sent to driver ${driverId}`);
    }catch(error){

        if(error.statusCode === 410 || error.statusCode === 404){
            await redisClient.del(`driver:${driverId}:webpush`);
            console.log(`Subscription for driver ${driverId} is no longer valid and has been removed.`);
            return;
        }
        console.error(`Failed to send notification to driver ${driverId}:`, error);
    }
}