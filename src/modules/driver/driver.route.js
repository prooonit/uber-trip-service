const express = require("express");
const router = express.Router();
const { updateStatus } = require("./driver.controller");
const { getNearbyDrivers } = require("./driver.controller");
const { manageNotifications } = require("./driver.controller");

router.post("/status", updateStatus);
router.get("/nearby",getNearbyDrivers);
router.post("/notify",manageNotifications);


module.exports = router;
