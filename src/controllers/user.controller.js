import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError} from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse} from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async(req,res)=> {
    // get user detail from frontend
    // validate user details 
    //check if user already exists: username, email
    // check for images, check for required field like avatar
    // upload img to cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token form res
    // check for user creation
    // return res
    const { userName, email, fullName, password} = req.body;
    console.log("userName: ", userName);

    if(
        [fullName, email, userName, password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, " all fields are mandatory");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (existedUser) {
        throw new ApiError(409, " user already existed");
    }

    // console.log("req.files: ", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("avatarLocalPath ", avatarLocalPath);
    // console.log("is avatarLocalPath undefined: ", avatarLocalPath === undefined);
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; ////handling if coverimage is not sent
    // console.log("coverImagePath: " , coverImageLocalPath)

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(avatarLocalPath === undefined || avatarLocalPath === null) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // console.log("cloudinarAvtar: ", avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath); 


    if(!avatar){
        throw new ApiError(400, "avatar is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "something went wrong in registration")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, " User Registered Successfully")
    )
})



export { registerUser}