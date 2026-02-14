import express from "express";
import { AuthController } from "../controllers/authController.js";
import { jwtAuthMiddleware } from "../utils/jwt.js";

const authRouter = express.Router();
const authController = new AuthController();

authRouter.post("/signup", authController.signupUser);
authRouter.post("/login", authController.loginUser);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.put("/update-password", jwtAuthMiddleware, authController.updatePassword);

export default authRouter;
