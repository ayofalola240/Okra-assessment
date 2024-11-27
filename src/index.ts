import { createServer } from "http";
import mongoose from "mongoose";
import { app } from "./app";

const validateEnvVars = () => {
  const requiredEnvVars = ["MONGO_URI", "PORT"];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} must be defined`);
    }
  });
};

const start = async () => {
  console.log("Starting up app....");

  // Validate environment variables
  validateEnvVars();

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI must be defined");
    }
    await mongoose.connect(mongoUri);
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }

  const server = createServer(app);

  // Start the server
  const port = parseInt(process.env.PORT || "4000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server is listening on port ${port}`);
  });
};

start();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
