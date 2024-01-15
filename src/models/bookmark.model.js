import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videos",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

export const Bookmark = mongoose.model("Bookmark", BookmarkSchema);
