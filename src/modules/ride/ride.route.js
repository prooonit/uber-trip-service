const express = require("express");
const router = express.Router();
const { confirmRide } = require("./ride.controller");

router.post("/confirm", confirmRide);

module.exports = router;
