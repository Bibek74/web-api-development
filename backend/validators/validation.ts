import { z } from "zod";

// Auth Validation Schemas
export const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "admin"]).optional().default("user")
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

export const updatePasswordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_new_password: z.string().min(6, "Confirm password must be at least 6 characters")
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address")
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_new_password: z.string().min(6, "Confirm password must be at least 6 characters")
});

// Post Validation Schemas
export const createPostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title is too long"),
    content: z.string().min(1, "Content cannot be empty").max(5000, "Content is too long"),
    image: z.string().optional()
});

export const updatePostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title is too long").optional(),
    content: z.string().min(1, "Content cannot be empty").max(5000, "Content is too long"),
    image: z.string().optional()
});

// Profile Validation Schemas
export const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address")
});

export const deleteProfileSchema = z.object({
    password: z.string().min(1, "Password is required")
});
