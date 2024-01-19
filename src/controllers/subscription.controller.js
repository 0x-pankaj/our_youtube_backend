import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  console.log("id: ", channelId);
  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }

  const subscriber = await Subscription.aggregate([
    {
      $match: {
        $and: [
          {
            subscriber: new mongoose.Types.ObjectId(req.user?._id),
          },
          {
            channel: new mongoose.Types.ObjectId(channelId),
          },
        ],
      },
    },
  ]);

  if (subscriber.length === 0) {
    await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });
    res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: true }, " successfully subscribed")
      );
  } else {
    await Subscription.findByIdAndDelete(subscriber[0]._id);
    res
      .status(200)
      .json(new ApiResponse(200, { subscribed: false }, "unsubscribed"));
  }
});

//return subscriber list of channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId} = req.params;
    console.log("channel: ", channelId);

    if(!channelId){
        throw new ApiError(400, "channelId is required")
    }

    const subscriber = await Subscription.aggregate([
        {
            $match: {
                $and: [
                    {
                        subscriber: {$exists: true}
                    },
                    {
                        channel: new mongoose.Types.ObjectId(channelId)
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])


    res.status(200).json(new ApiResponse(200, subscriber, "get all subscriber"))

});


//return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId} = req.params;

    if(!subscriberId){
        throw new ApiError(400, "channelId is required")
    }

    const subscribedChannel = await Subscription.aggregate([
        {
            $match: {
                $and: [
                    {
                        subscriber: new mongoose.Types.ObjectId(subscriberId)
                    },
                    {
                        channel: { $exists: true}
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

   res.status(200).json(new ApiResponse(200, subscribedChannel, "get All subscribed channel"));




});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
