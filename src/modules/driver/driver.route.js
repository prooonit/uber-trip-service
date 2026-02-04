import express from "express";
import {updateStatus,getNearbyDrivers,manageNotifications} from "./driver.controller.js";

const router = express.Router();

router.get("/healthcheck", (req, res) => {
  res.status(200).send("Driver Service is up and running");
});

router.post("/status", updateStatus);
router.get("/nearby", getNearbyDrivers);
router.post("/notify", manageNotifications);

export default router;
