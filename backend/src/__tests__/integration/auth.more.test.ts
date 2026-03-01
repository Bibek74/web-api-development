import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { cleanupUserByEmail, loginUser, registerUser, uniqueSuffix } from "../helpers";

describe("Auth API More Integration Tests", () => {
    const suffix = uniqueSuffix("auth-more");
    const email = `auth.more.${suffix}@example.com`;
    const name = `Auth More ${suffix}`;
    const password = "password123";
    const nextPassword = "password456";

    afterAll(async () => {
        await cleanupUserByEmail(email);
    });

    it("POST /api/auth/signup registers user successfully", async () => {
        const res = await request(app).post("/api/auth/signup").send({
            name,
            email,
            password
        });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User Created");
    });

    it("POST /api/auth/register returns 409 for duplicate email", async () => {
        const res = await registerUser({
            name,
            email,
            password
        });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/register returns 400 for invalid email", async () => {
        const res = await registerUser({
            name: "Invalid Email User",
            email: "not-an-email",
            password
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/register returns 400 for missing password", async () => {
        const res = await request(app).post("/api/auth/register").send({
            name: "Missing Password",
            email: `missing.pass.${suffix}@example.com`
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/login returns 400 when required fields are missing", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/login returns 404 for unknown email", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: `missing.${suffix}@example.com`,
            password
        });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/login returns 401 for wrong password", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email,
            password: "wrong-password"
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/login returns 200 with token and cookie for valid credentials", async () => {
        const { response } = await loginUser({ email, password });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.headers["set-cookie"]?.join(";")).toContain("auth_token=");
    });

    it("POST /api/auth/forgot-password returns success for unknown email", async () => {
        const res = await request(app).post("/api/auth/forgot-password").send({
            email: `nobody.${suffix}@example.com`
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("POST /api/auth/forgot-password returns mocked reset token for existing email", async () => {
        const res = await request(app).post("/api/auth/forgot-password").send({ email });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data?.resetToken).toBe("test-uuid-1234-5678-90ab-cdef");
    });

    it("POST /api/auth/reset-password returns 400 for invalid token", async () => {
        const res = await request(app).post("/api/auth/reset-password").send({
            token: "invalid-token",
            new_password: nextPassword,
            confirm_new_password: nextPassword
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("PUT /api/auth/update-password updates password and allows login with new password", async () => {
        const login = await loginUser({ email, password });

        expect(login.token).toBeDefined();

        const updateRes = await request(app)
            .put("/api/auth/update-password")
            .set("Authorization", `Bearer ${login.token}`)
            .send({
                current_password: password,
                new_password: nextPassword,
                confirm_new_password: nextPassword
            });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.success).toBe(true);

        const relogin = await loginUser({ email, password: nextPassword });
        expect(relogin.response.status).toBe(200);
        expect(relogin.response.body.success).toBe(true);
    });
});