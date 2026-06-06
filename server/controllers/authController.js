const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const BCRYPT_SALT_ROUNDS = 12;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d";

// Register a new user account
async function register(req, res) {
    const { email, password, username } = req.body || {};

    // Reject requests missing required fields
    if (!email || !password) {
        return res.status(400).json({
            code: "VALIDATION_ERROR",
            message: "Email and password are required",
        });
    }

    try {
        // Hash password before storing — plain text must never reach the database
        const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const id = await Users.create({ email, password_hash, username });

        // Return created user info — never include password or hash in the response
        return res.status(201).json({ id, email, username });
    } catch (err) {
        // SQLite UNIQUE constraint fires when email or username is already registered
        if (err && err.code === "SQLITE_CONSTRAINT") {
            const message = err.message.includes('users.email')
                ? 'Email already exists'
                : 'Username already taken';
            return res.status(409).json({
                code: "CONFLICT",
                message,
            });
        }
        // Unexpected errors bubble up to the Express error handler
        throw err;
    }
}

// Verify credentials and issue a JWT
async function login(req, res) {
    const { email, password } = req.body || {};

    // Reject requests missing required fields
    if (!email || !password) {
        return res.status(400).json({
            code: "VALIDATION_ERROR",
            message: "Email and password are required",
        });
    }

    const user = await Users.findByEmail(email);

    // Use the same 401 response for unknown email and wrong password
    // to avoid leaking which one failed (prevents username enumeration)
    if (!user) {
        return res.status(401).json({
            code: "INVALID_CREDENTIALS",
            message: "invalid credentials",
        });
    }

    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
        return res.status(401).json({
            code: "INVALID_CREDENTIALS",
            message: "invalid credentials",
        });
    }

    // Sign a JWT containing only the user id — never put secrets in the payload
    const token = jwt.sign(
        { sub: user.id },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );

    return res.status(200).json({ token });
}

module.exports = { register, login };