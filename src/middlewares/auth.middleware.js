import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // console.log("verifyJwt called");
    // console.log("req,: ",  req);
    // console.log("cookies: " ,  req.cookies)
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log("token: ", token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    console.log("before decode, ", token);
    const decodedInformation = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    console.log("decoded:", decodedInformation);
    const user = await User.findById(decodedInformation?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "invalid Access Token");
    }
    req.user = user;
    console.log("user from middleware :", req.user);
    next();
  } catch (error) {
    throw new ApiError(403, error?.message || "Invalid access token");
  }
});
