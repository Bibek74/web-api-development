import { Request, Response } from "express";
import userModel from "../models/user.js";
import postModel from "../models/post.js";
import { createPostSchema, updatePostSchema } from "../validators/validation.js";

export class PostController {
    // New Post
    addNewPost = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = createPostSchema.parse(req.body);
            
            const user = await userModel.findOne({ _id: req.user!.userId });
            if (!user) {
                res.send({
                    message: "User not found",
                    success: false
                });
                return;
            }
            const createdPost = await postModel.create({
                user: user._id,
                content: validatedData.content
            });
            user.posts.push(createdPost._id as any);
            await user.save();
            res.send({
                message: "Post created successfully!",
                result: createdPost,
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // GET All Post
    getAllPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const allPosts = await postModel
                .find()
                .populate("user", "name email")
                .sort({ date: -1 });
            res.send({
                message: "Posts fetched successfully!",
                result: allPosts,
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Like/Unlike a post By id
    likeUnlikeById = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await postModel.findOne({ _id: req.params.id });
            if (!post) {
                res.send({
                    message: "Post not found",
                    success: false
                });
                return;
            }
            if (post.likes.includes(req.user!.userId as any)) {
                // Already liked --> remove like
                await postModel.findOneAndUpdate(
                    { _id: req.params.id },
                    { $pull: { likes: req.user!.userId } }
                );
                res.send({
                    message: "Like Removed",
                    success: true
                });
                return;
            } else {
                post.likes.push(req.user!.userId as any);
                await post.save();
                res.send({
                    message: "Liked",
                    success: true
                });
            }
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Get Total Likes By post id
    getTotalLikesById = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await postModel.findOne({ _id: req.params.id });
            if (!post) {
                res.send({
                    message: "Post not found",
                    success: false
                });
                return;
            }
            const totalLikes = post.likes.length;
            const likedby = await userModel.find({ _id: post.likes }).select("name");
            res.send({
                message: "Likes",
                post: post,
                totalLikes: totalLikes,
                likedby: likedby,
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Update Post By post id 
    updatePostById = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = updatePostSchema.parse(req.body);

            const existingPost = await postModel.findOne({ _id: req.params.id });
            if (!existingPost) {
                res.status(404).send({
                    message: "Post not found",
                    success: false
                });
                return;
            }

            if (existingPost.user.toString() !== req.user!.userId) {
                res.status(403).send({
                    message: "You can only update your own posts",
                    success: false
                });
                return;
            }
            
            const updatedPost = await postModel.findOneAndUpdate(
                { _id: req.params.id, user: req.user!.userId },
                { content: validatedData.content }
            );
            if (!updatedPost) {
                res.send({
                    message: "Post not found",
                    success: false
                });
                return;
            }
            const post = await postModel.findOne({ _id: req.params.id });
            res.send({
                message: "Post updated successfully!",
                result: post,
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // View My Posts
    viewMyPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const myPosts = await userModel
                .findOne({ _id: req.user!.userId })
                .select("posts")
                .populate({
                    path: "posts",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                });
            res.send({
                message: `Author: ${req.user!.name}`,
                result: myPosts,
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Delete Post By post id
    deletePostById = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await postModel.findOne({ _id: req.params.id });
            if (!post) {
                res.status(404).send({
                    message: "Post not found",
                    success: false
                });
                return;
            }

            if (post.user.toString() !== req.user!.userId) {
                res.status(403).send({
                    message: "You can only delete your own posts",
                    success: false
                });
                return;
            }

            await postModel.findOneAndDelete({ _id: req.params.id, user: req.user!.userId });

            await userModel.findOneAndUpdate(
                { _id: req.user!.userId },
                { $pull: { posts: req.params.id } }
            );

            res.send({
                message: "Post deleted successfully!",
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };
}
