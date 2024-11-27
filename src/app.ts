import express from "express";
import dotenv from "dotenv";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { NotFoundError } from "./errors";
import { errorHandler } from "./middlewares";
import userRouter from "./routers/users.routes";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// Allow all origins
app.use(cors());

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.json());

// RATE LIMITER SETUP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

app.use(limiter);

// ROUTES
app.use("/api/v1/users", userRouter);

app.all("*", (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
