import { Request, Response } from "express";
import userModel from "../models/user.js";
import * as bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { signupSchema, loginSchema, updatePasswordSchema } from "../validators/validation.js";

export class AuthController {
    // Register Account
    signupUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = signupSchema.parse(req.body);
            
            // Check if a user with the provided email already exists in the database
            const user = await userModel.findOne({ email: validatedData.email });
            if (user) {
                res.send({ message: "Email already exists!", success: false });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(validatedData.password, salt, async (err, hash) => {
                        const createdUser = await userModel.create({
                            name: validatedData.name,
                            email: validatedData.email,
                            password: hash,
                            role: validatedData.role || "user"
                        });
                        res.send({ message: "User registered successfully!", success: true });
                    });
                });
            }
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Login Account
    loginUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = loginSchema.parse(req.body);
            
            // Check if a user with the provided email exists in the database
            const user = await userModel.findOne({ email: validatedData.email });
            if (!user) {
                res.send({ message: "Invalid credentials!", success: false });
            } else {
                bcrypt.compare(validatedData.password, user.password, (err, result) => {
                    if (result) {
                        const payload = {
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            userId: (user._id as any).toString()
                        };
                        const token = generateToken(payload);
                        res.send({
                            message: "Logged in successfully",
                            success: true,
                            token: token,
                            data: {
                                _id: (user._id as any).toString(),
                                name: user.name,
                                email: user.email,
                                role: user.role
                            }
                        });
                    } else {
                        res.send({
                            message: "Something went wrong!",
                            success: false
                        });
                    }
                });
            }
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    // Update password
    updatePassword = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = updatePasswordSchema.parse(req.body);
            
            const user = await userModel.findOne({ _id: req.user!.userId });

            if (!user) {
                res.send({
                    message: "User not found",
                    success: false
                });
                return;
            }

            bcrypt.compare(validatedData.current_password, user.password, (err, result) => {
                if (!result) {
                    return res.send({
                        message: "Current password do not match",
                        success: false
                    });
                }
                if (validatedData.new_password !== validatedData.confirm_new_password) {
                    return res.send({
                        message: "New passwords do not match.",
                        success: false
                    });
                }
                // Update with hashed password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(validatedData.confirm_new_password, salt, async (err, hash) => {
                        const updatePassword = await userModel.findOneAndUpdate(
                            { _id: req.user!.userId },
                            { $set: { password: hash } },
                            { new: true } // return updated document
                        );
                        res.send({
                            message: "Password updated successfully",
                            result: updatePassword,
                            success: true
                        });
                    });
                });
            });
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };
}
