import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Auth API Integration Tests", () => {
    const testUser = {
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        confirmPassword: "password123"
    };

    beforeAll(async () => {
        await UserModel.deleteOne({ email: testUser.email });
    });

    afterAll(async () => {
        await UserModel.deleteOne({ email: testUser.email });
    });

    describe("POST /api/auth/register", () => {
        it("missing fields validation should return 400 and body.success false", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({ email: testUser.email });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it("valid registration should return 201, body.success true, body.message === 'User Created'", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User Created");
        });
    });

    describe("POST /api/auth/login", () => {
        it("valid credentials should return 200, body.success true, body.token defined", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
        });

        it("invalid email should return 404, body.success false", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "invalid@example.com",
                    password: testUser.password
                });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});