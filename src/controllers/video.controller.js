import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

   




});

const publishVideo = asyncHandler(async (req, res) => {
  console.log("from publishVideo");
  const { title, description } = req.body;
  console.log(title, description);

  if (!title || !description) {
    throw new ApiError(400, "title and description is required");
  }

  const videoFilePath = req.files?.videoFile[0].path;
  const thumbnailFilePath = req.files?.thumbnail[0].path;
  if (!videoFilePath || !thumbnailFilePath) {
    throw new ApiError(400, "video and thumbnail is required");
  }

  const uploadedVideo = await uploadOnCloudinary(videoFilePath);
  console.log("updlaoded video detai: ", uploadedVideo);
  const uploadedThumbnail = await uploadOnCloudinary(thumbnailFilePath);
  console.log("uploaded thumbnail detail: ", uploadedThumbnail);

  if (!uploadedVideo || !uploadedThumbnail) {
    throw new ApiError(
      500,
      "error while uploading video or thumbnail to cloudinary"
    );
  }

  const videoUplaoded = await Video.create({
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    owner: req.user?._id,
    title,
    description,
    duration: uploadedVideo.duration,
    views: 0,
    isPublished: true,
  });
  // console.log("videoUploaded detail after created: ", videoUplaoded);
  res
    .status(200)
    .json(new ApiResponse(201, videoUplaoded, "Video uplaoded successFully"));
});

/*
const getVideoById = asyncHandler(async (req, res) => {
  console.log("from get video by id");
  const { videoId } = req.params;
  console.log("videoId: ", videoId);
  if (!videoId) {
    throw new ApiError(400, "video id is mandatory");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video doesn't exist ");
  }

  res.status(200).json(new ApiResponse(200, video, "video found !"));
});
*/

const getVideoById = asyncHandler(async(req,res)=> {
  const { videoId } = req.params;
  if(!videoId){
    throw new ApiError(400, "must have video id");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId)
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
              fullName: 1,
              avatar: 1,
              views: 1,
              createdAt: 1
            }
          }          
        ]
      }
    },
    // addFields with same name override the owner field and $first return first object from arr of owner field basically make res less nested 
    {
      $addFields: {
        owner: {
          $first: "$owner"
        }
      }
    }
  ])
  if(!video){
    throw new ApiError(400, "invalid video Id")
  }
  console.log("video : ", video);

  res
      .status(200)
      .json(
        new ApiResponse(200, video, "successFully getVideo by id")
      )

  

})


/*
const updateVideo = asyncHandler(async (req, res) => {
    console.log("from updateVideo section");
    const { name, description} = req.body;
    const { videoId } = req.params;
    if(!videoId){
        throw new ApiError(400, "must have video id");
    }
    // if(!name && !description){
    //     throw new ApiError(400, "must have atleast one field ")
    // }
    let videoToUpdate;
    let thumbnailToUpdate;
    videoToUpdate = req.files?.videoFile[0].path;
    thumbnailToUpdate = req.files?.thumbnail[0].path;
    const updatedVideo = await uploadOnCloudinary(videoToUpdate);
    const updatedThumbnail = await uploadOnCloudinary(thumbnailToUpdate);

    const videoAfterUpdated = await Video.findByIdAndUpdate(videoId,{
        $set: {
            name,
            description,
            videoFile: updatedVideo?.url,
            thumbnail: updatedThumbnail?.url

        },
        
            new: true
        
    })

    console.log("vidoer after updated: ", videoAfterUpdated);

    res.send("ok");

    
});
*/

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, " must have video id");
  }

  const videoToUpdatePath = req.files?.videoFile[0].path;
  if (!videoToUpdatePath) {
    throw new ApiError(400, "video path is missing");
  }
  const videoOnCloudinary = await uploadOnCloudinary(videoToUpdatePath);
  if (!videoOnCloudinary) {
    throw new ApiError(500, "unable to upload video ");
  }

  const videoAfterUpdated = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        videoFile: videoOnCloudinary.url,
      },
    },
    {
      new: true,
    }
  );

  console.log("videoAfterUpdated: ", videoAfterUpdated);

  res
    .status(200)
    .json(
      new ApiResponse(203, videoAfterUpdated, "video updated successfully ")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id is missing");
  }
  await Video.findByIdAndDelete(videoId);

  res.status(200).json(new ApiResponse(200, {}, "deleted successFully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  console.log("from togglePUblishStatus");
  const { videoId } = req.params;
  if(!videoId){
    throw new ApiError(400, "must have videoId");
  }

  const video = await Video.findById(videoId);

  if(!video){
    throw new ApiError(400, "video doesn't exist");
  }
  video.isPublished = !video.isPublished
  await video.save();

  res
      .status(200)
      .json(
        new ApiResponse(200, video, "publish status toggled")
      )

});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
