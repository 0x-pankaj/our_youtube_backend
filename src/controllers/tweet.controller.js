import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet} from "../models/tweet.model.js"
import  mongoose  from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const createTweet = asyncHandler(async(req,res)=> {
    console.log("from  createtweet");

    const { content} = req.body;
    if(!content){
        throw new ApiError(400, "content is required")
    }

   const tweet =  await Tweet.create({
        owner: new mongoose.Types.ObjectId(req.user?._id),
        content: content
    })
    if(!tweet){
        throw new ApiError(400, "error while creating tweet on database")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "successFully created tweet")
        )
    
})

const getUserTweets = asyncHandler(async(req,res)=> {
    console.log("from getUserTweets: ");

    /*
    const { userId} = req.params;
    if(!userId){
        throw new ApiError(400, "userId is required")
    }

    
    const tweet = await Tweet.findById(userId)
    if(!tweet){
        throw new ApiError(400, " userId is invalid")
    }
    */
   const tweet = await Tweet.aggregate([
    {
        $match: {
            owner: new mongoose.Types.ObjectId(req.user?._id)
        }
    }
   ])

    res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "find user tweet successFully")
        )

})

const updateTweet = asyncHandler(async(req,res)=> {
    console.log("from updateTweet");
    const {tweetId} = req.params;
    const { content } = req.body;
    if(!tweetId || !content){
        throw new ApiError(400, "tweetId and content is required to update")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content: content
        }
    },
    {
        new: true
    })

    if(!updatedTweet){
        throw new ApiError(400, " invalid tweetId")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, updatedTweet, "successFully updated tweets")
        )

})

const deleteTweet = asyncHandler(async(req,res)=> {
    console.log("from deleteTweet : ");
    const { tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(400, "tweetId is required")
    }

    await Tweet.findByIdAndDelete(tweetId);

    res
        .status(200)
        .json(
            new ApiResponse(200, {} , "successFully deleted")
        )

})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}