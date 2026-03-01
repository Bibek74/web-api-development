import request from "supertest";
import app from "../app";
import { UserModel } from "../models/user.model";
import postModel from "../../models/post";

type RegisterUserData = {
    name?: string;
    firstname?: string;
    lastname?: string;
    email: string;
    password: string;
    role?: "user" | "admin";
    [key: string]: unknown;
};

type LoginCredentials = {
    email: string;
    password: string;
};

type PostData = {
    title?: string;
    content?: string;
    image?: Buffer;
};

export const uniqueSuffix = (prefix = "test") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const registerUser = async (userData: RegisterUserData) => {
    return request(app).post("/api/auth/register").send(userData);
};

const extractTokenFromCookie = (cookies?: string[]) => {
    if (!cookies?.length) {
        return undefined;
    }

    const authCookie = cookies.find((cookie) => cookie.startsWith("auth_token="));
    if (!authCookie) {
        return undefined;
    }

    return authCookie.split(";")[0]?.replace("auth_token=", "");
};

export const loginUser = async (credentials: LoginCredentials) => {
    const response = await request(app).post("/api/auth/login").send(credentials);
    const cookie = response.headers["set-cookie"]?.[0];
    const token = response.body?.token || extractTokenFromCookie(response.headers["set-cookie"]);

    return {
        response,
        token,
        cookie
    };
};

export const authHeader = (token: string) => ({
    Authorization: `Bearer ${token}`
});

export const cookieHeader = (cookie: string) => ({
    Cookie: cookie
});

export const seedPost = async (token: string, postData: PostData = {}) => {
    const title = postData.title ?? `Post ${uniqueSuffix("title")}`;
    const content = postData.content ?? `Content ${uniqueSuffix("content")}`;

    const req = request(app)
        .post("/api/post/new")
        .set(authHeader(token))
        .field("title", title)
        .field("content", content);

    if (postData.image) {
        req.attach("postImage", postData.image, "post.png");
    }

    return req;
};

export const cleanupUserByEmail = async (email: string) => {
    await UserModel.deleteMany({ email });
};

export const cleanupPostsByAuthor = async (authorId: string) => {
    await postModel.deleteMany({ user: authorId });
};