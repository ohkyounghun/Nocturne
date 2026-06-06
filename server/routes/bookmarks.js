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
module.exports = router;
