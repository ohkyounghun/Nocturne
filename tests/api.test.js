const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const os = require("os");
const path = require("path");
const request = require("supertest");

process.env.JWT_SECRET = "api-test-secret";
const testDbFile = path.join(os.tmpdir(), `nocturne-api-${process.pid}.db`);
process.env.DB_FILE = testDbFile;

const app = require("../server/app");
const { closeDb, initDb } = require("../server/db/database");

const TEST_EMAIL = "api-test@nocturne.local";
const TEST_PASSWORD = "test-password-123";
const TEST_USERNAME = "api_test_user";

describe("API integration", () => {
    let authToken;
    let testSpotId;

    beforeAll(async () => {
        const db = await initDb();
        const passwordHash = await bcrypt.hash(TEST_PASSWORD, 4);

        await db.run("DELETE FROM users WHERE email = ?", [TEST_EMAIL]);
        await db.run(
            `
            INSERT INTO users (email, password_hash, username)
            VALUES (?, ?, ?)
            `,
            [TEST_EMAIL, passwordHash, TEST_USERNAME]
        );

        const user = await db.get(
            "SELECT id FROM users WHERE email = ?",
            [TEST_EMAIL]
        );
        const spot = await db.run(
            `
            INSERT INTO spots (
                user_id,
                title,
                description,
                latitude,
                longitude
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [user.id, "API Test Spot", "Duplicate request fixture", 37.5, 127.0]
        );

        authToken = jwt.sign(
            { sub: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        testSpotId = spot.lastID;
    });

    afterAll(async () => {
        await closeDb();
        fs.rmSync(testDbFile, { force: true });
    });

    test("POST /api/auth/login returns 200 for valid credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toEqual(expect.any(String));
    });

    test("POST /api/spots/:id/comments returns 401 without a token", async () => {
        const response = await request(app)
            .post("/api/spots/1/comments")
            .send({ content: "Authentication required" });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ code: "UNAUTHORIZED" });
    });

    test("GET /api/spots returns 200 with an array", async () => {
        const response = await request(app).get("/api/spots");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test("POST /api/spots/:id/likes returns 409 for a duplicate like", async () => {
        const endpoint = `/api/spots/${testSpotId}/likes`;
        const firstResponse = await request(app)
            .post(endpoint)
            .set("Authorization", `Bearer ${authToken}`);
        const duplicateResponse = await request(app)
            .post(endpoint)
            .set("Authorization", `Bearer ${authToken}`);

        expect(firstResponse.status).toBe(201);
        expect(duplicateResponse.status).toBe(409);
        expect(duplicateResponse.body).toEqual({
            code: "ALREADY_LIKED",
            message: "You already liked this spot"
        });
    });
});
