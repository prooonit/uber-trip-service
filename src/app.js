import express from "express";
import driverRoutes from "./modules/driver/driver.route.js";
import rideRoutes from "./modules/ride/ride.route.js";

const app = express();

app.use(express.json());

app.use("/driver", driverRoutes);
app.use("/ride", rideRoutes);

export default app;
