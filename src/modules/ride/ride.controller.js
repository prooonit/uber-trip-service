import { confirmRideService } from "./ride.service.js";
import { acceptRideService } from "./ride.service.js";
import { rejectRideService } from "./ride.service.js";
import { startRideService } from "./ride.service.js";
import { completeRideService } from "./ride.service.js";
import { cancelRideService } from "./ride.service.js";
import { rideStatusService } from "./ride.service.js";

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
      console.log(req.body);
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

export const startRide =async(req,res)=>{
  const {driver_id,ride_id} = req.body;


  const result = await startRideService({driverId: driver_id, rideId: ride_id});

  if(result.success){
    return res.status(200).json({message: "Ride started successfully"});
  }
  return res.status(400).json({message: result.message});
}


export const completeRide = async(req,res)=>{
  const {driver_id,ride_id} = req.body;
  const result = await completeRideService({driverId: driver_id, rideId: ride_id});

  if(result.success){
    return res.status(200).json({message: "Ride completed successfully"});
  }
  return res.status(400).json({message: result.message});

}

export const cancelRide = async(req,res)=>{
  const {user_id} = req.body;
  if(!user_id){
    return res.status(400).json({message: "user_id is required"});
  }
  const result = await cancelRideService(user_id);

  if(result.success){
    return res.status(200).json({message: "Ride cancelled successfully"});
  }
  return res.status(400).json({message: result.message});
}


export const rideStatus = async(req,res)=>{
  const {userId} = req.body;
  if(!userId){
    return res.status(400).json({message: "userId is required"});
  }
 const result = await rideStatusService(userId);

 if(result.success){
  return res.status(200).json({message: "Ride status fetched successfully", status: result.status});
 }
  return res.status(400).json({message: result.message});}
