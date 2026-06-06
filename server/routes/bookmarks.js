const express = require('express');
const router = express.Router();
const bookmarksController = require('../controllers/bookmarksController');
const authenticate = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/users/me/bookmarks:
 *   get:
 *     summary: Get bookmarks for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, asyncHandler(bookmarksController.getMyBookmarks));

/**
 * @swagger
 * /api/spots/{id}/bookmarks:
 *   post:
 *     summary: Bookmark a spot
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Bookmark created
 *       400:
 *         description: Invalid spot id
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Spot already bookmarked by this user
 */

/**
 * @swagger
 * /api/spots/{id}/bookmarks:
 *   delete:
 *     summary: Remove a bookmark from a spot
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Bookmark removed
 *       400:
 *         description: Invalid spot id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bookmark not found
 */
module.exports = router;
