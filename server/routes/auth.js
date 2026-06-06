const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               username: { type: string }
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post("/register", asyncHandler(register));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Returns a JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", asyncHandler(login));

module.exports = router;