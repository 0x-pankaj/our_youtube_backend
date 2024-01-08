import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "20kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
);
app.use(express.static("public"));


//routers 
import userRouter from './routes/user.route.js';
import healthCheckRouter  from "./routes/healthcheck.route.js";
import videoRouter from "./routes/video.route.js";
//routes declaration
app.use("/api/v1/users", userRouter);

app.use("/api/v1/health-check", healthCheckRouter)

app.use("/api/v1/videos", videoRouter);

export { app };
