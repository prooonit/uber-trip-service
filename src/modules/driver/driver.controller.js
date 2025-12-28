const driverService = require("./driver.service");

exports.updateStatus = async (req, res) => {
  
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

exports.getNearbyDrivers = async (req, res) => {
  const { lat, lng, radius } = req.query;  
  if(!lat || !lng || !radius) {
    return res.status(400).json({ message: "Missing query parameters" });
  }
  const drivers = await driverService.findNearbyDrivers(lat, lng, radius);
  return res.json({ drivers }); 
 }
