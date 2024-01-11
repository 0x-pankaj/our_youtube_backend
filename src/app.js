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


//routers import
import userRouter from './routes/user.route.js';
import healthCheckRouter  from "./routes/healthcheck.route.js";
import videoRouter from "./routes/video.route.js";
import tweetRouter from "./routes/tweet.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import dashboardRouter from "./routes/dashboard.route.js";


//routes declaration
app.use("/api/v1/users", userRouter);

app.use("/api/v1/health-check", healthCheckRouter)

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/tweets", tweetRouter);

app.use("/api/v1/comments", commentRouter);

app.use("/api/v1/likes", likeRouter);

app.use("/api/v1/subscriptions", subscriptionRouter)

app.use("/api/v1/dashboard", dashboardRouter )

export { app };
