import "dotenv/config";
import app from "./app.js";
import "./workers/rideMatching.worker.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Location Service running on port ${PORT}`);
});
