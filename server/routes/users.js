const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const bookmarks = require('../models/bookmarks');
const likes = require('../models/likes');
const spots = require('../models/spots');

/**
 * @swagger
 * /api/users/me/bookmarks:
 *   get:
 *     summary: List the authenticated user's bookmarked spots
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Success }
 *       401: { description: Unauthorized }
 */
router.get('/me/bookmarks', authenticate, asyncHandler(async (req, res) => {
    const rows = await bookmarks.getByUser(req.user.sub);
    return res.json(rows);
}));

/**
 * @swagger
 * /api/users/me/likes:
 *   get:
 *     summary: List the spots the authenticated user has liked
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Success }
 *       401: { description: Unauthorized }
 */
router.get('/me/likes', authenticate, asyncHandler(async (req, res) => {
    const rows = await likes.getByUser(req.user.sub);
    return res.json(rows);
}));

/**
 * @swagger
 * /api/users/me/spots:
 *   get:
 *     summary: List the spots posted by the authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Success }
 *       401: { description: Unauthorized }
 */
router.get('/me/spots', authenticate, asyncHandler(async (req, res) => {
    const rows = await spots.findByUser(req.user.sub);
    return res.json(rows);
}));

module.exports = router;
