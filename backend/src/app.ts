import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "../routes/authRoute";
import profileRouter from "../routes/profileRoute";
import postRouter from "../routes/postRoute";
import adminRouter from "../routes/adminRoute";
import { errorHandler } from "../middlewares/errorHandler";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true
    })
);

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/post", postRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

export default app;