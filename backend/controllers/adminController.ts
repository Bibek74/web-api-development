import { Request, Response } from "express";
import userModel from "../models/user.js";
import * as bcrypt from "bcrypt";
import { signupSchema } from "../validators/validation.js";

export class AdminController {
    // Get all users (admin only)
    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = Math.max(Number(req.query.page) || 1, 1);
            const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
            const skip = (page - 1) * limit;

            const [users, totalUsers] = await Promise.all([
                userModel.find().select("-password").skip(skip).limit(limit).sort({ createdAt: -1 }),
                userModel.countDocuments()
            ]);

            const totalPages = Math.max(Math.ceil(totalUsers / limit), 1);

            res.json({ 
                success: true, 
                data: users,
                pagination: {
                    page,
                    limit,
                    totalUsers,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                message: "Users fetched successfully" 
            });
        } catch (err) {
            res.status(500).json({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Get user by ID (admin only)
    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await userModel.findById(req.params.id).select("-password");
            if (!user) {
                res.status(404).json({ 
                    message: "User not found", 
                    success: false 
                });
                return;
            }
            res.json({ 
                success: true, 
                data: user,
                message: "User fetched successfully" 
            });
        } catch (err) {
            res.status(500).json({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Create user (admin only)
    createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = signupSchema.parse(req.body);
            
            // Check if a user with the provided email already exists
            const existingUser = await userModel.findOne({ email: validatedData.email });
            if (existingUser) {
                res.status(400).json({ 
                    message: "Email already exists!", 
                    success: false 
                });
                return;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(validatedData.password, salt);

            // Create user
            const createdUser = await userModel.create({
                name: validatedData.name,
                email: validatedData.email,
                password: hash,
                role: validatedData.role || "user"
            });

            res.status(201).json({ 
                message: "User created successfully!", 
                success: true,
                data: {
                    _id: createdUser._id,
                    name: createdUser.name,
                    email: createdUser.email,
                    role: createdUser.role
                }
            });
        } catch (err) {
            res.status(500).json({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Update user (admin only)
    updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, email, role, password } = req.body;
            const userId = req.params.id;

            const user = await userModel.findById(userId);
            if (!user) {
                res.status(404).json({ 
                    message: "User not found", 
                    success: false 
                });
                return;
            }

            // Check if email is being changed and if it already exists
            if (email && email !== user.email) {
                const existingUser = await userModel.findOne({ email });
                if (existingUser) {
                    res.status(400).json({ 
                        message: "Email already exists!", 
                        success: false 
                    });
                    return;
                }
            }

            // Update fields
            if (name) user.name = name;
            if (email) user.email = email;
            if (role) user.role = role;
            
            // Hash new password if provided
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                user.password = hash;
            }

            await user.save();

            res.json({ 
                message: "User updated successfully!", 
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (err) {
            res.status(500).json({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Delete user (admin only)
    deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;
            
            const user = await userModel.findByIdAndDelete(userId);
            if (!user) {
                res.status(404).json({ 
                    message: "User not found", 
                    success: false 
                });
                return;
            }

            res.json({ 
                message: "User deleted successfully!", 
                success: true 
            });
        } catch (err) {
            res.status(500).json({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };
}
