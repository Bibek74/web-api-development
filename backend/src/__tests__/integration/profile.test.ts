import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { authHeader, cleanupUserByEmail, loginUser, registerUser, uniqueSuffix } from "../helpers";

describe("Profile API Integration Tests", () => {
    const suffix = uniqueSuffix("profile");
    const email = `profile.user.${suffix}@example.com`;
    const password = "password123";
    const updatedEmail = `profile.updated.${suffix}@example.com`;

    let token = "";
    let userId = "";

    beforeAll(async () => {
        await registerUser({ name: `Profile User ${suffix}`, email, password });
        const login = await loginUser({ email, password });
        token = login.token || "";

        const user = await UserModel.findOne({ email });
        userId = String(user?._id || "");
    });

    afterAll(async () => {
        await cleanupUserByEmail(email);
        await cleanupUserByEmail(updatedEmail);
    });

    it("GET /api/profile/me returns 401 without auth", async () => {
        const res = await request(app).get("/api/profile/me");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/profile/me returns current user profile with auth", async () => {
        const res = await request(app).get("/api/profile/me").set(authHeader(token));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result.email).toBe(email);
        expect(res.body.result.password).toBeUndefined();
    });

    it("PUT /api/profile/update returns 401 without auth", async () => {
        const res = await request(app).put("/api/profile/update").send({
            name: "No Auth User",
            email: updatedEmail
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/profile/update returns success false for missing name", async () => {
        const res = await request(app)
            .put("/api/profile/update")
            .set(authHeader(token))
            .send({ email: updatedEmail });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/profile/update returns success false for invalid email", async () => {
        const res = await request(app)
            .put("/api/profile/update")
            .set(authHeader(token))
            .send({
                name: "Invalid Email",
                email: "invalid-email"
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/profile/update updates profile successfully", async () => {
        const res = await request(app)
            .put("/api/profile/update")
            .set(authHeader(token))
            .send({
                name: `Updated Profile ${suffix}`,
                email: updatedEmail
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result.email).toBe(updatedEmail);
    });

    it("GET /api/profile/visit returns 401 without auth", async () => {
        const res = await request(app).get("/api/profile/visit");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/profile/visit returns profile list with auth", async () => {
        const res = await request(app).get("/api/profile/visit").set(authHeader(token));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.result)).toBe(true);
    });

    it("GET /api/profile/visit/:id returns 400 for invalid id", async () => {
        const res = await request(app).get("/api/profile/visit/not-a-valid-id");

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/profile/visit/:id returns 404 for non-existing valid id", async () => {
        const res = await request(app).get(`/api/profile/visit/${new mongoose.Types.ObjectId().toString()}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/profile/upload-image requires file when authenticated", async () => {
        const res = await request(app)
            .put("/api/profile/upload-image")
            .set(authHeader(token));

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/profile/upload-image uploads image and returns updated profile", async () => {
        const res = await request(app)
            .put("/api/profile/upload-image")
            .set(authHeader(token))
            .attach("profileImage", Buffer.from("fake-image-bytes"), "avatar.png");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result.profileImage).toContain("/uploads/");
    });

    it("DELETE /api/profile/delete removes account with correct password", async () => {
        const res = await request(app)
            .delete("/api/profile/delete")
            .set(authHeader(token))
            .send({ password });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const deletedUser = await UserModel.findById(userId);
        expect(deletedUser).toBeNull();
    });
});