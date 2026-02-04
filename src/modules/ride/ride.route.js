import express from "express";
import {confirmRide} from "./ride.controller.js";
import {acceptRide} from "./ride.controller.js";

const router = express.Router();

router.post("/confirm", confirmRide);
router.get("/healthcheck", (req, res) => {
  res.status(200).send("pronit is up and running");
});
router.post("/accept", acceptRide);


export default router;
