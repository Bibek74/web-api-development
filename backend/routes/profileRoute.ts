import express from "express";
import { jwtAuthMiddleware } from "../utils/jwt.js";
import { ProfileController } from "../controllers/profileController.js";
import { uploadProfilePhoto } from "../middlewares/uploadProfilePhoto.js";

const profileRouter = express.Router();
const profileController = new ProfileController();

profileRouter.get("/me", jwtAuthMiddleware, profileController.getMyProfile);
profileRouter.put("/update", jwtAuthMiddleware, profileController.updateMyProfile);
profileRouter.delete("/delete", jwtAuthMiddleware, profileController.deleteMyProfile);
profileRouter.get("/visit/:id", profileController.getPublicProfileById);
profileRouter.get("/visit", jwtAuthMiddleware, profileController.visitOthersProfile);
profileRouter.put("/upload-image", jwtAuthMiddleware, uploadProfilePhoto.single("profileImage"), profileController.uploadProfileImage);

export default profileRouter;
