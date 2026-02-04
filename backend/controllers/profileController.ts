import { Request, Response } from "express";
import userModel from "../models/user.js";
import * as bcrypt from "bcrypt";
import { updateProfileSchema, deleteProfileSchema } from "../validators/validation.js";

export class ProfileController {
    // GET My Profile 
    getMyProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await userModel.findOne({ _id: req.user!.userId }).populate("posts");
            if (!user) {
                res.send({
                    message: "User not found",
                    success: false
                });
                return;
            }
            res.send({
                message: `Hi! ${user.name}, Welcome to your profile.`,
                posts: user.posts,
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
                }
            );
            if (!updateProfile) {
                res.send({
                    message: "Profile not found",
                    success: false
                });
                return;
            }
            const user = await userModel.findOne({ _id: req.user!.userId }).select("name email");
            res.send({
                message: "Profile Updated",
                result: user,
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
}
