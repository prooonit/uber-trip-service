import * as driverService from "./driver.service.js";


export const updateStatus = async (req, res) => {
  
  const { driver_id, status, lat, lng } = req.body;

  if (!driver_id || !status) {
    return res.status(400).json({ message: "Missing data" });
  }

  if (status === "ONLINE") {
    await driverService.storeLocation(driver_id, lat, lng);
    return res.json({ message: "Driver location stored" });
  }

  if (status === "OFFLINE") {
    await driverService.removeDriver(driver_id);
    return res.json({ message: "Driver removed" });
  }

  res.json({ message: "Status updated" });
};

export const getNearbyDrivers = async (req, res) => {
  const { lat, lng, radius } = req.query;  
  if(!lat || !lng || !radius) {
    return res.status(400).json({ message: "Missing query parameters" });
  }
  const drivers = await driverService.findNearbyDrivers(lat, lng, radius);
  return res.json({ drivers }); 
 }


export const manageNotifications = async (req, res) => {

    try{
      const { driver_id, subscription } = req.body;
      if(!driver_id || !subscription) {
        return res.status(400).json({ message: "Missing data" });
      }
      await driverService.storeNotificationSubscription(driver_id, subscription);
      return res.json({ message: "Subscription stored" });

    }catch(error){
       return  res.status(500).json({ message: "Failed to store subscription" });
    }
    
 }
