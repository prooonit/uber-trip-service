const {confirmRideService} = require ('./ride.service');



exports.confirmRide= async(req,res)=>{
    try{
       const{user_id,pickup_lat, pickup_lng, dropoff_lat, dropoff_lng}=req.body;
       const result = await confirmRideService({
           userId: user_id,
           pickup: { lat: pickup_lat, lng: pickup_lng },
           drop: { lat: dropoff_lat, lng: dropoff_lng },});

    return res.status(200).json({message:"Ride confirmed", ride: result});
    }
    catch(error){   
        return res.status(500).json({message:"Something went wrong"});
    }

}