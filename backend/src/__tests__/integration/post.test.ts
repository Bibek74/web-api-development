import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import postModel from "../../../models/post";
import {
    authHeader,
    cleanupPostsByAuthor,
    cleanupUserByEmail,
    loginUser,
    registerUser,
    seedPost,
    uniqueSuffix
} from "../helpers";

describe("Post API Integration Tests", () => {
    const suffix = uniqueSuffix("post");

    const ownerEmail = `post.owner.${suffix}@example.com`;
    const otherEmail = `post.other.${suffix}@example.com`;
    const adminEmail = `post.admin.${suffix}@example.com`;

    const password = "password123";

    let ownerToken = "";
    let otherToken = "";
    let adminToken = "";

    let ownerId = "";
    let otherId = "";
    let adminId = "";

    let postId = "";
    let adminDeletePostId = "";

    beforeAll(async () => {
        await registerUser({ name: `Owner ${suffix}`, email: ownerEmail, password });
        await registerUser({ name: `Other ${suffix}`, email: otherEmail, password });
        await registerUser({ name: `Admin ${suffix}`, email: adminEmail, password });

        const owner = await UserModel.findOne({ email: ownerEmail });
        const other = await UserModel.findOne({ email: otherEmail });
        const admin = await UserModel.findOneAndUpdate(
            { email: adminEmail },
            { $set: { role: "admin" } },
            { new: true }
        );

        ownerId = String(owner?._id || "");
        otherId = String(other?._id || "");
        adminId = String(admin?._id || "");

        ownerToken = (await loginUser({ email: ownerEmail, password })).token || "";
        otherToken = (await loginUser({ email: otherEmail, password })).token || "";
        adminToken = (await loginUser({ email: adminEmail, password })).token || "";
    });

    afterAll(async () => {
        if (ownerId) {
            await cleanupPostsByAuthor(ownerId);
        }
        if (otherId) {
            await cleanupPostsByAuthor(otherId);
        }
        if (adminId) {
            await cleanupPostsByAuthor(adminId);
        }

        await cleanupUserByEmail(ownerEmail);
        await cleanupUserByEmail(otherEmail);
        await cleanupUserByEmail(adminEmail);
    });

    it("POST /api/post/new returns 401 without auth", async () => {
        const res = await request(app).post("/api/post/new").field("title", "No Auth").field("content", "Blocked");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/post/new returns success false for missing required fields", async () => {
        const res = await request(app).post("/api/post/new").set(authHeader(ownerToken)).field("title", "ab");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/post/new creates a post with valid payload", async () => {
        const res = await seedPost(ownerToken, {
            title: `First Post ${suffix}`,
            content: `First post content ${suffix}`
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result._id).toBeDefined();

        postId = String(res.body.result._id);
    });

    it("GET /api/post/all returns posts list", async () => {
        const res = await request(app).get("/api/post/all");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.result)).toBe(true);
    });

    it("POST /api/post/like-unlike/:id returns 401 without auth", async () => {
        const res = await request(app).post(`/api/post/like-unlike/${postId}`);

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/post/like-unlike/:id returns success false for invalid id", async () => {
        const res = await request(app)
            .post("/api/post/like-unlike/not-a-valid-id")
            .set(authHeader(otherToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/post/like-unlike/:id likes a post", async () => {
        const res = await request(app)
            .post(`/api/post/like-unlike/${postId}`)
            .set(authHeader(otherToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Liked");
    });

    it("POST /api/post/like-unlike/:id unlikes a previously liked post", async () => {
        const res = await request(app)
            .post(`/api/post/like-unlike/${postId}`)
            .set(authHeader(otherToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Like Removed");
    });

    it("GET /api/post/user/likes/:id returns likes metadata", async () => {
        const res = await request(app)
            .get(`/api/post/user/likes/${postId}`)
            .set(authHeader(ownerToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.totalLikes).toBe("number");
    });

    it("PUT /api/post/update/:id returns 401 without auth", async () => {
        const res = await request(app)
            .put(`/api/post/update/${postId}`)
            .field("title", "No Auth")
            .field("content", "No Auth Content");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/post/update/:id returns 403 for non-owner non-admin", async () => {
        const res = await request(app)
            .put(`/api/post/update/${postId}`)
            .set(authHeader(otherToken))
            .field("title", "Hacker Edit")
            .field("content", "Hacker content");

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/post/update/:id allows owner to update post", async () => {
        const updatedContent = `Updated content ${suffix}`;
        const res = await request(app)
            .put(`/api/post/update/${postId}`)
            .set(authHeader(ownerToken))
            .field("title", `Updated title ${suffix}`)
            .field("content", updatedContent);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result.content).toBe(updatedContent);
    });

    it("DELETE /api/post/delete-post/:id returns 403 for non-owner non-admin", async () => {
        const res = await request(app)
            .delete(`/api/post/delete-post/${postId}`)
            .set(authHeader(otherToken));

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it("DELETE /api/post/delete-post/:id allows admin to delete any post", async () => {
        const seeded = await seedPost(ownerToken, {
            title: `Admin delete target ${suffix}`,
            content: `Admin delete content ${suffix}`
        });
        adminDeletePostId = String(seeded.body.result._id);

        const res = await request(app)
            .delete(`/api/post/delete-post/${adminDeletePostId}`)
            .set(authHeader(adminToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const deleted = await postModel.findById(adminDeletePostId);
        expect(deleted).toBeNull();
    });

    it("GET /api/post/my-posts returns authenticated user's posts", async () => {
        const res = await request(app).get("/api/post/my-posts").set(authHeader(ownerToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result).toBeDefined();
    });

    it("GET /api/post/user/likes/:id returns success false for unknown valid post id", async () => {
        const res = await request(app)
            .get(`/api/post/user/likes/${new mongoose.Types.ObjectId().toString()}`)
            .set(authHeader(ownerToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(false);
    });
});