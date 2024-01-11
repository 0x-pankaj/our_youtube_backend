import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// get the channel stats like total video views , total subscribers , total videos, total likes
const getChannelStats = asyncHandler(async (req, res) => {
  //getting total likes
  // const likes = await Like.aggregate([
  //     {

  //     }
  // ])

  const videos = await User.aggregate([
    {
      $match: {_id: new mongoose.Types.ObjectId(req.user?._id)},
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        pipeline: [
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "totalLikes"
                }
            }
        ]
      },
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $addFields: {
            totalVideo: {
                $size: "$videos"
            },
            totalViews: {
               $sum: "$videos.views"
            },
            totalSubscriber: {
                $size: "$subscribers"
            },
            totalLikes: {
                $size: "$videos.totalLikes"
            }
            
        }
    },
    {
        $project: {
            userName: 1,
            fullName: 1,
            totalVideo: 1,
            totalViews: 1,
            totalSubscriber: 1,
            totalLikes:1
            
        }
    }
  ]);

  res.status(200).json(new ApiResponse(200, videos, "get channel stats"));
});

//get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    {
      $match: {
        $and: [
          {
            owner: new mongoose.Types.ObjectId(req.user?._id),
          },
          {
            isPublished: true,
          },
        ],
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, videos, "get all videos"));
});

export { getChannelStats, getChannelVideos };
