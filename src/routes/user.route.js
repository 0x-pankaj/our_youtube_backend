import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/abc",).get((req,res)=> {
  console.log("req: ", req);
  res.send("abc");
})

router.route("/refresh-token").post(refreshAccessToken)

export default router;
