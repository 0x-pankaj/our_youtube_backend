import { Bookmark } from "../models/bookmark.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video} from "../models/video.model.js"
import mongoose from "mongoose"
const toggleBookmark = asyncHandler(async(req,res)=> {

    try {
        
        const { videoId}= req.params;
        if(!videoId){
            throw new ApiError(400, "video Id is required")
        }

        const isBookmarked = await Bookmark.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId),
                    owner: new mongoose.Types.ObjectId(req.user?._id)
                }
            }
        ]) 

       
        if(isBookmarked.length !== 0){
            await Bookmark.findByIdAndDelete(isBookmarked._id)
            res.status(200).json(new ApiResponse(200, {addedToBookmark: true}, "added to bookmark successfully"))
        }else{
             // validation is video id is correct

            const video = await Video.findById(videoId);
            if(!video){
                throw new ApiError(400, "incorrect video Id")
            }
            const videoAdd = await Bookmark.create({
                video: videoId,
                owner: req.user?._id
            })
            if(!videoAdd){
                throw new ApiError(500, "error while added video to bookmark" )
            }
            res.status(200).json(200, { addedToBookmark: false}, "removed successfully")

        }



    } catch (error) {
        throw new ApiError(400, error)
    }
      
})

const getAllBookmark = asyncHandler(async(req,res)=> {

    try {

        const video = await Bookmark.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(req.user?._id)
                }
            }
        ])
        if(!video){
            throw new ApiError(400, "invalid user id or no video added to bookmark")
        }

        res.status(200).json(200,video, "get all video successfully")

    } catch (error) {
        throw new ApiError(400, error)
    }

})



export {
    toggleBookmark,
    getAllBookmark
}