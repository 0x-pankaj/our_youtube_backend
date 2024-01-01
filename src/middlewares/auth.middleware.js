import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from 'jsonwebtoken';
import {User} from "../models/user.model.js"


export const verifyJWT = asyncHandler(async(req, _,next)=> {
    try {
        const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        console.log("token: " , token)

        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedInformation = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedInformation?._id).select("-password" "-refreshToken")

        if(!user){
            throw new ApiError(401, "invalid Access Token");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(403, error?.message || "Invalid access token")
    }
})
