import { Request, Response } from "express";
import userModel from "../models/user.js";
import postModel from "../models/post.js";
import * as bcrypt from "bcrypt";
import { updateProfileSchema, deleteProfileSchema } from "../validators/validation.js";

export class ProfileController {
    // GET My Profile 
    getMyProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await userModel.findOne({ _id: req.user!.userId }).populate({
                path: "posts",
                options: { sort: { date: -1 } }
            });
            if (!user) {
                res.send({
                    message: "User not found",
                    success: false
                });
                return;
            }
            
            // Return complete user profile data
            res.send({
                message: `Hi! ${user.name}, Welcome to your profile.`,
                posts: user.posts,
                result: {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage || ""
                },
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Update My Profile
    updateMyProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = updateProfileSchema.parse(req.body);
            
            const updateProfile = await userModel.findOneAndUpdate(
                { _id: req.user!.userId },
                {
                    $set: {
                        name: validatedData.name,
                        email: validatedData.email
                    }
                },
                { new: true }
            );
            if (!updateProfile) {
                res.send({
                    message: "Profile not found",
                    success: false
                });
                return;
            }
            
            res.send({
                message: "Profile Updated",
                result: {
                    _id: updateProfile._id.toString(),
                    name: updateProfile.name,
                    email: updateProfile.email,
                    role: updateProfile.role,
                    profileImage: updateProfile.profileImage || ""
                },
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Delete Profile
    deleteMyProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = deleteProfileSchema.parse(req.body);
            
            const user = await userModel.findOne({ _id: req.user!.userId });
            if (!user) {
                res.send({
                    message: "User not found!",
                    success: false
                });
                return;
            }
            bcrypt.compare(validatedData.password, user.password, async (err, result) => {
                if (!result) {
                    return res.send({
                        message: "Password do not match!",
                        success: false
                    });
                }
                const deletedUser = await userModel.findOneAndDelete({ _id: req.user!.userId });
                res.send({
                    message: `Your Profile ${req.user!.name} has been deleted successfully!`,
                    success: true
                });
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };
    
    // Visit Others Profile
    visitOthersProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const allProfiles = await userModel.find().select("name");
            res.send({
                message: "All Profiles",
                result: allProfiles,
                success: true
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Visit Profile By Id (Public)
    getPublicProfileById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;

            if (!userId) {
                res.status(400).send({
                    message: "User id is required",
                    success: false
                });
                return;
            }

            const profile = await userModel
                .findById(userId)
                .select("_id name role profileImage");

            if (!profile) {
                res.status(404).send({
                    message: "Profile not found",
                    success: false
                });
                return;
            }

            const posts = await postModel
                .find({ user: userId })
                .populate("user", "_id name email profileImage")
                .sort({ date: -1 });

            res.send({
                message: "Profile fetched successfully",
                result: {
                    _id: profile._id.toString(),
                    name: profile.name,
                    role: profile.role,
                    profileImage: profile.profileImage || ""
                },
                posts,
                success: true
            });
        } catch (err) {
            res.status(400).send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Upload Profile Image
    uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).send({
                    message: "No image file provided",
                    success: false
                });
                return;
            }

            const imagePath = `/uploads/${req.file.filename}`;
            
            const updatedUser = await userModel.findOneAndUpdate(
                { _id: req.user!.userId },
                { $set: { profileImage: imagePath } },
                { new: true }
            );

            if (!updatedUser) {
                res.status(404).send({
                    message: "User not found",
                    success: false
                });
                return;
            }

            res.send({
                message: "Profile image uploaded successfully",
                result: {
                    _id: updatedUser._id.toString(),
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    profileImage: updatedUser.profileImage || ""
                },
                success: true
            });
        } catch (err) {
            res.status(500).send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };
}
