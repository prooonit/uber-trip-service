const express = require("express");
const app = express();

app.use(express.json());

const driverRoutes = require("./modules/driver/driver.route");
app.use("/driver", driverRoutes);

module.exports = app;
