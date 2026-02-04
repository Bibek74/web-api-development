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

// Post Validation Schemas
export const createPostSchema = z.object({
    content: z.string().min(1, "Content cannot be empty").max(5000, "Content is too long")
});

export const updatePostSchema = z.object({
    content: z.string().min(1, "Content cannot be empty").max(5000, "Content is too long")
});

// Profile Validation Schemas
export const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address")
});

export const deleteProfileSchema = z.object({
    password: z.string().min(1, "Password is required")
});
