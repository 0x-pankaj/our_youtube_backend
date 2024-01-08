

import { Router } from "express";

import { verifyJWT } from '../middlewares/auth.middleware.js';
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.use(verifyJWT)

router.route("/get-all-videos").get(getAllVideos);

router.route("/publish").post(
    upload.fields( [
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1
        },
    ]),
    publishVideo
)
router.route("/getvideo/:videoId").get(getVideoById);

/*
router.route("/update-video/:videoId").patch(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        }
    ]),
    updateVideo
)
*/
router.route("/update-video/:videoId").patch(
    upload.single("videoFile"), updateVideo
)

router.route("/delete-video/:videoId").delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);



export default router;