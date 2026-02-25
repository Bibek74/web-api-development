import express from "express";
import { jwtAuthMiddleware } from "../utils/jwt.js";
import { PostController } from "../controllers/postController.js";
import { uploadPostImage } from "../middlewares/uploadPostImage.js";

const postRouter = express.Router();
const postController = new PostController();

postRouter.post("/new", jwtAuthMiddleware, uploadPostImage.single("postImage"), postController.addNewPost);
postRouter.get("/all", postController.getAllPost); // Public endpoint - no auth required
postRouter.post("/like-unlike/:id", jwtAuthMiddleware, postController.likeUnlikeById);
postRouter.get("/user/likes/:id", jwtAuthMiddleware, postController.getTotalLikesById);
postRouter.put("/update/:id", jwtAuthMiddleware, uploadPostImage.single("postImage"), postController.updatePostById);
postRouter.get("/my-posts", jwtAuthMiddleware, postController.viewMyPost);
postRouter.delete("/delete-post/:id", jwtAuthMiddleware, postController.deletePostById);

export default postRouter;
