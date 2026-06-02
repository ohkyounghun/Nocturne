const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/users");

async function register(req, res) {
    const { email, password, username } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            code: "VALIDATION_ERROR",
            message: "Email and password are required"
        });
    }

    try {
        const password_hash = await bcrypt.hash(password, 12);
        const id = await Users.create({ email, password_hash, username });

        return res.status(201).json({
            id,
            email,
            username
        });
    } catch (err) {
        if (err && err.code === "SQLITE_CONSTRAINT") {
            return res.status(409).json({
                code: "CONFLICT",
                message: "Email already exists"
            });
        }

        throw err;
    }
}

async function login(req, res) {
    const { email, password } = req.body || {};

    message: "Email and password are required"
});
    }

const user = await Users.findByEmail(email);

if (!user) {
    return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "invalid credentials"
    });
}

const ok = await bcrypt.compare(password, user.password_hash);

if (!ok) {
    return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "invalid credentials"
    });
}

const token = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

return res.status(200).json({ token });
}

module.exports = {
    register,
    login
};