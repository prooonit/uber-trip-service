import express from "express";
import cors from "cors";
import driverRoutes from "./modules/driver/driver.route.js";
import rideRoutes from "./modules/ride/ride.route.js";

const app = express();
app.use(cors({
  origin: ["http://127.0.0.1:5501"],
  credentials: true
}));


app.use(express.json());

app.use("/driver", driverRoutes);
app.use("/ride", rideRoutes);

export default app;
