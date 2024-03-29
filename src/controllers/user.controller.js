import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    console.log("accessToken: while generating", accessToken);
    const refreshToken = await user.generateRefreshToken();
    console.log("refreshToken: while generating", refreshToken);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // check while error Todo
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating Access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user detail from frontend
  // validate user details
  //check if user already exists: username, email
  // check for images, check for required field like avatar
  // upload img to cloudinary , avatar
  // create user object - create entry in db
  // remove password and refresh token form res
  // check for user creation
  // return res
  const { userName, email, fullName, password } = req.body;
  console.log("userName: ", userName);

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, " all fields are mandatory");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (avatarLocalPath === undefined || avatarLocalPath === null) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log("cloudinarAvtar: ", avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong in registration");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, " User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get req data from user
  //check data and validate
  //find the user
  //verify password
  //generate access token and refresh token
  //send res in cookie

  const { email, userName, password } = req.body;

  if (!(userName || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, "user doesn't exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "bad credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log("accessToken: from login route ", accessToken);
  console.log("refreshToken: from login route ", refreshToken);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "Successfully logedIn User"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //clear cookie
  //remove refresh token
  // console.log(req.user);
  // console.log("logOut is called");

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logout Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedRefreshToken) {
      throw new ApiError(401, " Invalid refresh token");
    }

    const user = await User.findById(decodedRefreshToken._id);

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refreshToken expired");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newAccessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            newAccessToken,
            newRefreshToken,
          },
          "Acess token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refreshToken");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //get user current password and newpassword
  //validate data
  //check user isloged in
  //get user
  //change password
  //return res
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, " must have both currentPassword and newPassword");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "currentPassword is inCorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user data "));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  console.log("req: ", req.body);
  const { fullName, email } = req.body;
  console.log("from updateAcoount : ");
  console.log("fullName: ", fullName, email);
  if (!fullName && !email) {
    throw new ApiError(400, "must have atleast one field to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  console.log("req.file from updateUserAvatar: ", req.file);
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
  if (!uploadedAvatar) {
    throw new ApiError(400, " error while uploading on avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: uploadedAvatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar is updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!uploadedCoverImage) {
    throw new ApiError(400, " error while uploading on avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: uploadedCoverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "successfully coverImage updated"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  console.log("userName: ", userName);
  if (!userName?.trim()) {
    throw new ApiError(400, " not getting channel name from url as parameter");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers", //$size if error
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo", //$size if error
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  // console.log("channel: ", channel);
  if (!channel?.length) {
    throw new ApiError(404, "channel doesn't exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel[0],
        "user channel details fetched successfully"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  console.log("getWatchHistory: triggered");
  // console.log("user: ", req.user._id.toString());
  // console.log("user id type: ", typeof(req.user._id))
  // const array = Object.keys(req.user)
  // console.log("array: ", array)
  // console.log("user id : ", req.user._id[1])
  console.log("user id: ", req.user._id);
  console.log("new user id only: ", new mongoose.Types.ObjectId(req.user._id));

  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
          // _id: req.user._id
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      userName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: {
                  $first: "$owner",
                },
              },
            },
          ],
        },
      },
    ]);
    console.log("user from history matching: ", user);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user[0].watchHistory,
          "watchHistory fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || " error from user history matching"
    );
  }
});

const addVideoToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) {
    throw new ApiError(400, "video Id is required");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $push: {watchHistory: new mongoose.Types.ObjectId(videoId)},
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        addVideoToWatchHistory,
        "added video successfully to watchHistory"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  addVideoToWatchHistory
};
