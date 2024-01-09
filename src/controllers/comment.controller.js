
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler} from "../utils/asyncHandler.js"
import { Comment} from "../models/comment.model.js"
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";


const getVideoComments = asyncHandler(async(req,res)=> {
    //get all the comment of a videos
    console.log("from getVideoComments");
    const { videoId} = req.params;
    console.log(videoId);
    const { page=1,limit=10} = req.query;

    if(!videoId){
        throw new ApiError(400, "video id is required")
    }

    const allComment = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
            
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            },
                       
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])
    res
        .status(200)
        .json(
            new ApiResponse(200, allComment, "successfully get all comment on given video")
        )


})

const addComment = asyncHandler(async(req,res)=> {

    const { videoId} = req.params;

    const {content} = req.body;
    if(!content || !videoId){
        throw new ApiError(400, "content and videoId is required")
    }

    const comment = await Comment.create({
        content: content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id)  
    })
    if(!comment){
        throw new ApiError(400, "invalid videoId")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, comment, "successfully added comment ")
        )

})

const updateComment = asyncHandler(async(req,res)=> {
    const {commentId} = req.params;
    const {contentToUpdate} = req.body;
    
    if(!commentId || !contentToUpdate){
        throw new ApiError(400, "videoId is required")
    }

    const commentAfterUpdate = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content: contentToUpdate
        }
    },{
        new: true
    })

    if(!commentAfterUpdate){
        throw new ApiError(400, "invalid videoId")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, commentAfterUpdate, "successfully updated comment")
        )

})

const deleteComment = asyncHandler(async(req,res)=> {
    const { commentId} = req.params;

    if(!commentId){
        throw new ApiError(400, "video Id is required to delete")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if(!deletedComment){
        throw new ApiError(400, "invalid comment Id")
    }
    // console.log(deletedComment);

    res
        .status(200)
        .json(
            new ApiResponse(200, {}, "comment deleted successfully")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}