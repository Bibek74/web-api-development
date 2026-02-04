import express from "express";
import * as dotenv from "dotenv";
import authRouter from "./routes/authRoute.js";
import profileRouter from "./routes/profileRoute.js";
import postRouter from "./routes/postRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import { DBconnection } from "./db/db.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads folder
app.use("/uploads", express.static("uploads"));

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/post", postRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start The Server
const PORT = process.env.PORT || 3000;

// Connect to Database
await DBconnection();

app.listen(PORT, () => {

    console.log(`Server is running on the port ${PORT}`);
});
