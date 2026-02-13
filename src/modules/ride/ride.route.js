import express from "express";
import {confirmRide} from "./ride.controller.js";
import {acceptRide} from "./ride.controller.js";
import {rejectRide} from "./ride.controller.js";
import {startRide} from "./ride.controller.js";
import {completeRide} from "./ride.controller.js";
import {cancelRide} from "./ride.controller.js";
import {rideStatus} from "./ride.controller.js";

const router = express.Router();

router.post("/confirm-ride", confirmRide);
router.post("/accept", acceptRide);
router.post("/reject", rejectRide);
router.post("/start-ride",startRide);
router.post("/ride-complete",completeRide);

router.post ("cancel-ride", cancelRide);
router.get ("ride-status", rideStatus);


export default router;
