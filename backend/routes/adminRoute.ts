import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { jwtAuthMiddleware } from "../utils/jwt.js";

const adminRouter = express.Router();
const adminController = new AdminController();

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ 
            message: "Access denied. Admin only.", 
            success: false 
        });
    }
};

// All routes require authentication and admin role
adminRouter.use(jwtAuthMiddleware);
adminRouter.use(isAdmin);

// User management routes
adminRouter.get("/users", adminController.getAllUsers);
adminRouter.get("/users/:id", adminController.getUserById);
adminRouter.post("/users", adminController.createUser);
adminRouter.put("/users/:id", adminController.updateUser);
adminRouter.delete("/users/:id", adminController.deleteUser);

export default adminRouter;
