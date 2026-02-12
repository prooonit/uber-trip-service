import { confirmRideService } from "./ride.service.js";
import { acceptRideService } from "./ride.service.js";
import { rejectRideService } from "./ride.service.js";

export const confirmRide = async (req, res) => {
  try {
    const {user_id,pickup_lat,pickup_lng,dropoff_lat,dropoff_lng,} = req.body;

    const result = await confirmRideService({
      userId: user_id,
      pickup: { lat: pickup_lat, lng: pickup_lng },
      drop: { lat: dropoff_lat, lng: dropoff_lng },
    });

    return res.status(200).json({
      message: "Ride confirmed",
      ride: result,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const acceptRide = async(req, res)=>{
    try {
    const result = await acceptRideService(req.body);

    if (!result.success) {
      return res.status(409).json({ message: result.message });
    }

    return res.json({ message: "Ride accepted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export const rejectRide = async(req, res)=>{
    const {driver_id,ride_id} = req.body;

    if(!driver_id || !ride_id){
        return res.status(400).json({message: "driver_id and ride_id are required"});
    }
    
    const result = await rejectRideService({driverId: driver_id, rideId: ride_id});

     return result;
}
