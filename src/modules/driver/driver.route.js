const express = require("express");
const router = express.Router();
const { updateStatus } = require("./driver.controller");
const { getNearbyDrivers } = require("./driver.controller");

router.post("/status", updateStatus);
router.get("/nearby",getNearbyDrivers);

module.exports = router;
