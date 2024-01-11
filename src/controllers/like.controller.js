import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  // const video = await Video.findById(videoId);
  const likedVideo = await Like.aggregate([
    {
      $match: {
        $and: [
          {
            video: new mongoose.Types.ObjectId(videoId),
          },
          {
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
          },
        ],
      },
    },
  ]);
  //   console.log("liked: ", likedVideo[0]._id);
  if (likedVideo.length == 0) {
    await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    res
      .status(200)
      .json(new ApiResponse(200, { isLiked: true }, "get likedVideo"));
  } else {
    await Like.findByIdAndDelete(likedVideo[0]._id);
    res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "get likedVideo"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "comment id is required");
  }
  const toggleComment = await Like.aggregate([
    {
      $match: {
        $and: [
          {
            comment: new mongoose.Types.ObjectId(commentId),
          },
          {
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
          },
        ],
      },
    },
  ]);
  if (toggleComment.length == 0) {
    await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    res
      .status(200)
      .json(new ApiResponse(200, { isLiked: true }, "successfully liked"));
  } else {
    await Like.findByIdAndDelete(toggleComment[0]._id);
    res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "successfully unliked comment"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }
  const toogleTweet = Like.aggregate([
    {
      $match: {
        $and: [
          {
            tweet: new mongoose.Types.ObjectId(tweetId),
          },
          {
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
          },
        ],
      },
    },
  ]);

  if ((await toogleTweet).length == 0) {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    res
      .status(200)
      .json(new ApiResponse(200, { isLiked: true }, "successfully liked"));
  } else {
    await Like.findByIdAndDelete(toogleTweet[0]._id);
    res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "unliked tweet"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideo = await Like.aggregate([
    {
      $match: {
        $and: [
          {
            video: { $exists: true },
          },
          {
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
          },
        ],
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
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
                    userName: 1,
                    fullName: 1,
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

  res.status(200).json(new ApiResponse(200, likedVideo, "get liked video"));
});

export { toggleCommentLike, toggleVideoLike, toggleTweetLike, getLikedVideos };
