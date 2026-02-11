import app from "./app.js";
import dotenv from "dotenv";
import "./workers/rideMatching.worker.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Location Service running on port ${PORT}`);
});
