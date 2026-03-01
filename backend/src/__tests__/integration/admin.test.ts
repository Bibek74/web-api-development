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

describe("Admin API Integration Tests", () => {
    const suffix = uniqueSuffix("admin");

    const adminEmail = `admin.user.${suffix}@example.com`;
    const normalEmail = `normal.user.${suffix}@example.com`;
    const managedEmail = `managed.user.${suffix}@example.com`;
    const password = "password123";

    let adminToken = "";
    let normalToken = "";
    let adminId = "";
    let normalId = "";
    let createdManagedUserId = "";
    let adminDeleteTargetPostId = "";

    beforeAll(async () => {
        await registerUser({ name: `Admin ${suffix}`, email: adminEmail, password });
        await registerUser({ name: `Normal ${suffix}`, email: normalEmail, password });

        const adminUser = await UserModel.findOneAndUpdate(
            { email: adminEmail },
            { $set: { role: "admin" } },
            { new: true }
        );
        const normalUser = await UserModel.findOne({ email: normalEmail });

        adminId = String(adminUser?._id || "");
        normalId = String(normalUser?._id || "");

        adminToken = (await loginUser({ email: adminEmail, password })).token || "";
        normalToken = (await loginUser({ email: normalEmail, password })).token || "";
    });

    afterAll(async () => {
        if (adminId) {
            await cleanupPostsByAuthor(adminId);
        }
        if (normalId) {
            await cleanupPostsByAuthor(normalId);
        }
        if (createdManagedUserId) {
            await cleanupPostsByAuthor(createdManagedUserId);
        }

        await cleanupUserByEmail(adminEmail);
        await cleanupUserByEmail(normalEmail);
        await cleanupUserByEmail(managedEmail);
    });

    it("GET /api/admin/users returns 401 without auth", async () => {
        const res = await request(app).get("/api/admin/users");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/admin/users returns 403 for non-admin user", async () => {
        const res = await request(app).get("/api/admin/users").set(authHeader(normalToken));

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/admin/users returns paginated users for admin", async () => {
        const res = await request(app)
            .get("/api/admin/users?page=1&limit=5")
            .set(authHeader(adminToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
    });

    it("GET /api/admin/users/:id returns a user for admin", async () => {
        const res = await request(app)
            .get(`/api/admin/users/${normalId}`)
            .set(authHeader(adminToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(normalId);
    });

    it("GET /api/admin/users/:id returns 404 for missing user", async () => {
        const res = await request(app)
            .get(`/api/admin/users/${new mongoose.Types.ObjectId().toString()}`)
            .set(authHeader(adminToken));

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/admin/users returns 500 for invalid body", async () => {
        const res = await request(app)
            .post("/api/admin/users")
            .set(authHeader(adminToken))
            .send({ email: managedEmail });

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/admin/users creates a user for admin", async () => {
        const res = await request(app)
            .post("/api/admin/users")
            .set(authHeader(adminToken))
            .send({
                name: `Managed ${suffix}`,
                email: managedEmail,
                password,
                role: "user"
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe(managedEmail);

        createdManagedUserId = String(res.body.data._id);
    });

    it("PUT /api/admin/users/:id returns 400 for invalid role", async () => {
        const res = await request(app)
            .put(`/api/admin/users/${createdManagedUserId}`)
            .set(authHeader(adminToken))
            .send({ role: "superadmin" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/admin/users/:id updates managed user", async () => {
        const updatedName = `Managed Updated ${suffix}`;
        const res = await request(app)
            .put(`/api/admin/users/${createdManagedUserId}`)
            .set(authHeader(adminToken))
            .send({ name: updatedName, role: "admin" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(updatedName);
        expect(res.body.data.role).toBe("admin");
    });

    it("DELETE /api/admin/users/:id returns 404 for non-existing user", async () => {
        const res = await request(app)
            .delete(`/api/admin/users/${new mongoose.Types.ObjectId().toString()}`)
            .set(authHeader(adminToken));

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("DELETE /api/admin/users/:id deletes managed user", async () => {
        const res = await request(app)
            .delete(`/api/admin/users/${createdManagedUserId}`)
            .set(authHeader(adminToken));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const user = await UserModel.findById(createdManagedUserId);
        expect(user).toBeNull();
        createdManagedUserId = "";
    });

    it("Admin token can delete another user's post via /api/post/delete-post/:id", async () => {
        const seeded = await seedPost(normalToken, {
            title: `Admin cross-delete ${suffix}`,
            content: `Cross-delete content ${suffix}`
        });

        adminDeleteTargetPostId = String(seeded.body.result._id);

        const deleteRes = await request(app)
            .delete(`/api/post/delete-post/${adminDeleteTargetPostId}`)
            .set(authHeader(adminToken));

        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.success).toBe(true);

        const deletedPost = await postModel.findById(adminDeleteTargetPostId);
        expect(deletedPost).toBeNull();
    });
});