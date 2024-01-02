import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError} from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId)=> {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
         user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); // check while error Todo
        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "something went wrong while generating Access and refresh token");
    }
}


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

const loginUser = asyncHandler( async (req,res)=> {
    //get req data from user
    //check data and validate
    //find the user
    //verify password 
    //generate access token and refresh token
    //send res in cookie


    const { email, userName, password } = req.body;

    

    if(!(userName || email)){
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{email},{userName}]
    })

    if(!user){
        throw new ApiError(404, "user doesn't exist");
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "bad credentials")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const logedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    // console.log("accessToken: ", accessToken);
    // console.log("refreshToken: ", refreshToken);

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: logedInUser, 
                accessToken: accessToken, 
                refreshToken: refreshToken
            },
            "Successfully logedIn User"
        )
    )



})

const logoutUser = asyncHandler(async(req,res)=> {
    //clear cookie
    //remove refresh token
    // console.log(req.user);
    // console.log("logOut is called");

    await User.findByIdAndUpdate(
        req.user._id,
        {
           $set: {
            refreshToken: undefined
           }
        },
        {
            new: true
        }
    )


const options = {
        httpOnly: true,
        secure: true
    }

return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
    new ApiResponse(
        200,
        {},
        "user logout Successfully"
    )
)


})

const refreshAccessToken = asyncHandler( async(req,res)=> {
try {
    
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(401, "unauthorized request")
        }
    
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        if(!decodedRefreshToken){
            throw new ApiError(401, " Invalid refresh token")
        }
    
        const user = await User.findById(decodedRefreshToken._id)
        
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "refreshToken expired")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Acess token refreshed"
            )
        )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid refreshToken")
}

})






export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}