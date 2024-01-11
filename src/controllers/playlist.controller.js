import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //create playlist

  try {
    const { name, description } = req.body;
    if (!name || !description) {
      throw new ApiError(400, "name and description is required");
    }

    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user?._id,
    });

    res
      .status(200)
      .json(new ApiResponse(201, playlist, "created Successfully"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ApiError(400, "userId is required");
    }

    const playlist = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup:{
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos"
        }
      }
    ]);

    res.status(200).json(new ApiResponse(200, playlist[0], "get User Playlist"));
  } catch (error) {
    throw new ApiError(400, error);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    // const playlist = await Playlist.findById(playlistId);
    const playlist = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playlistId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
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
                      createdAt: 1,
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
            {
              $project: {
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                owner: 1,
              },
            },
          ],
        },
      },
   
    ]);

    if (!playlist) {
      throw new ApiError(400, "invalid playlist Id");
    }
    res.status(200).json(new ApiResponse(200, playlist, "get playlist by id"));
  } catch (error) {
    throw new ApiError(400, error);
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { videoId, playlistId } = req.params;
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: { videos: videoId },
      },
      {
        new: true,
      }
    );

    res
      .status(200)
      .json(new ApiResponse(200, playlist, "added video Successfully"));
  } catch (error) {
    throw new ApiError(400, error);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    try {
        const { videoId, playlistId} = req.params;
        if(!videoId || !playlistId){
            throw new ApiError(400, "videoId and playlistId is required")
        }

        const playlist = await Playlist.findByIdAndUpdate(playlistId,{
            $pull: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        })

        if(!playlist){
            throw new ApiError(400, "invalid playlist id")
        }
        res.status(200).json(new ApiResponse(200, playlist, "video removed successfully"))

    } catch (error) {
        throw new ApiError(400, error)
    }
});

const deletePlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId} = req.params;

        if(!playlistId){
            throw new ApiError(400, "playlist id is required to delete")
        }

        const playlist = await Playlist.findByIdAndDelete(playlistId);

        if(!playlist){
            throw new ApiError(400, "worng playlist id")
        }

        res.status(200).json(new ApiResponse(200, {}, "deleted successfully"))


    } catch (error) {
        throw new ApiError(400, error)
    }
});

const updatePlaylist = asyncHandler(async (req, res) => {
    try {
        
        const { name , description} = req.body;
        const { playlistId} = req.params;
        if(!playlistId){
            throw new ApiError(400, "palylist is required to update")
        }

        if(!name && !description){
            throw new ApiError(400, " must have one field to update")
        }

        const playlist = await Playlist.findByIdAndUpdate(playlistId, {
            name, 
            description
        },{
            new: true
        })

        res.status(200).json(new ApiResponse(200, playlist, "updated successfully"))


    } catch (error) {
        throw new ApiError(400, error)
    }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
