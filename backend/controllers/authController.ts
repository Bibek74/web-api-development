import { Request, Response } from "express";
import userModel from "../models/user.js";
import * as bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import {
    signupSchema,
    loginSchema,
    updatePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../validators/validation.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import nodemailer from "nodemailer";

export class AuthController {
    private sendPasswordResetEmail = async (email: string, resetLink: string): Promise<void> => {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@blogify.local";

        if (!host || !user || !pass) {
            console.log(`Password reset link for ${email}: ${resetLink}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });

        await transporter.sendMail({
            from,
            to: email,
            subject: "Blogify password reset",
            text: `Use this link to reset your password: ${resetLink}\nThis link expires in 30 minutes.`,
            html: `<p>Use this link to reset your password:</p><p><a href=\"${resetLink}\">${resetLink}</a></p><p>This link expires in 30 minutes.</p>`
        });
    };

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
                return;
            }

            // Use promise-based bcrypt comparison
            const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
            
            if (isPasswordValid) {
                const payload = {
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    userId: (user._id as any).toString()
                };
                const token = generateToken(payload);
                
                // Set JWT token in httpOnly cookie
                res.cookie("auth_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 3000 * 1000 // Same as token expiry (in milliseconds)
                });
                
                res.send({
                    message: "Logged in successfully",
                    success: true,
                    token: token,
                    data: {
                        _id: (user._id as any).toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        profileImage: user.profileImage || ""
                    }
                });
            } else {
                res.send({
                    message: "Invalid credentials!",
                    success: false
                });
            }
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const validatedData = forgotPasswordSchema.parse(req.body);
            const user = await userModel.findOne({ email: validatedData.email });

            if (!user) {
                res.send({
                    message: "If an account exists for this email, a reset link has been sent.",
                    success: true
                });
                return;
            }

            const rawToken = uuidv4();
            const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
            await user.save();

            const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
            const resetLink = `${frontendBase}/reset-password?token=${rawToken}`;
            const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

            await this.sendPasswordResetEmail(user.email, resetLink);

            const responsePayload: {
                message: string;
                success: boolean;
                data?: {
                    resetToken: string;
                    resetLink: string;
                };
            } = {
                message: "If an account exists for this email, a reset link has been sent.",
                success: true
            };

            if (process.env.NODE_ENV !== "production" || !smtpConfigured) {
                responsePayload.data = {
                    resetToken: rawToken,
                    resetLink
                };
            }

            res.send(responsePayload);
        } catch (err) {
            res.send({
                message: (err as Error).message ?? "Unknown error",
                success: false
            });
        }
    };

    resetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);

            if (validatedData.new_password !== validatedData.confirm_new_password) {
                res.send({
                    message: "New passwords do not match.",
                    success: false
                });
                return;
            }

            const hashedToken = crypto.createHash("sha256").update(validatedData.token).digest("hex");

            const user = await userModel.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: new Date() }
            });

            if (!user) {
                res.status(400).send({
                    message: "Invalid or expired reset token",
                    success: false
                });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(validatedData.new_password, salt);

            user.password = hash;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.send({
                message: "Password reset successfully",
                success: true
            });
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
