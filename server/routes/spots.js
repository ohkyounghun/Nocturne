const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const bookmarksController = require('../controllers/bookmarksController');
const commentsController = require('../controllers/commentsController');
const likesController = require('../controllers/likesController');
const spotsController = require('../controllers/spotsController');
const authenticate = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const spots = require('../models/spots');
const photos = require('../models/photos');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${req.user.sub}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        cb(null, file.mimetype.startsWith('image/'));
    }
});

/**
 * @swagger
 * /api/spots:
 *   get:
 *     summary: List top 10 spots for the card list
 *     parameters:
 *       - in: query
 *         name: tag
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by season or weather tag
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', asyncHandler(async (req, res) => {
    const tag = typeof req.query.tag === 'string'
        ? req.query.tag.trim()
        : '';
    const rows = await spots.findAll(tag || undefined);
    return res.json(rows);
}));

/**
 * @swagger
 * /api/spots/map:
 *   get:
 *     summary: List all spots for the map (no limit, includes easter egg spots)
 *     parameters:
 *       - in: query
 *         name: tag
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by season or weather tag
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/map', asyncHandler(async (req, res) => {
    const tag = typeof req.query.tag === 'string'
        ? req.query.tag.trim()
        : '';
    const rows = await spots.findAllForMap(tag || undefined);
    return res.json(rows);
}));

/**
 * @swagger
 * /api/spots:
 *   post:
 *     summary: Create a new spot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - latitude
 *               - longitude
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Spot created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, asyncHandler(spotsController.create));

/**
 * @swagger
 * /api/spots/{id}/comments:
 *   get:
 *     summary: List comments for a spot
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid spot id
 */
router.get('/:id/comments', asyncHandler(commentsController.listBySpot));

/**
 * @swagger
 * /api/spots/{id}/comments:
 *   post:
 *     summary: Create a comment on a spot
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Invalid spot id or comment content
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/comments', authenticate, asyncHandler(commentsController.create));

/**
 * @swagger
 * /api/spots/{spotId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment owned by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spotId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Comment deleted
 *       400:
 *         description: Invalid spot id or comment id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found or not owned by this user
 */
router.delete(
    '/:spotId/comments/:commentId',
    authenticate,
    asyncHandler(commentsController.remove)
);

/**
 * @swagger
 * /api/spots/{id}/likes:
 *   post:
 *     summary: Like a spot
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
 *         description: Like created
 *       400:
 *         description: Invalid spot id
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Spot already liked by this user
 */
router.post('/:id/likes', authenticate, asyncHandler(likesController.create));

/**
 * @swagger
 * /api/spots/{id}/likes:
 *   delete:
 *     summary: Remove a like from a spot
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
 *         description: Like removed
 *       400:
 *         description: Invalid spot id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Like not found
 */
router.delete('/:id/likes', authenticate, asyncHandler(likesController.remove));

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
router.post('/:id/bookmarks', authenticate, asyncHandler(bookmarksController.create));

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
router.delete('/:id/bookmarks', authenticate, asyncHandler(bookmarksController.remove));

/**
 * @swagger
 * /api/spots/{id}:
 *   get:
 *     summary: Get a spot by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Spot not found
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return res.status(400).json({ code: 'INVALID_SPOT_ID', message: 'Spot id must be a number' });
    }
    const spot = await spots.findById(id);
    if (!spot) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Spot not found' });
    }
    return res.json(spot);
}));

/**
 * @swagger
 * /api/spots/{id}:
 *   delete:
 *     summary: Delete a spot (owner only)
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
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — not the owner
 *       404:
 *         description: Spot not found
 */
router.delete('/:id', authenticate, asyncHandler(spotsController.remove));

router.post('/:id/photos', authenticate, upload.single('photo'), asyncHandler(async (req, res) => {
    const spotId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(spotId)) {
        return res.status(400).json({ code: 'INVALID_SPOT_ID', message: 'Spot id must be a number' });
    }
    if (!req.file) {
        return res.status(400).json({ code: 'NO_FILE', message: 'Image file is required' });
    }
    const url = `/uploads/${req.file.filename}`;
    const photo = await photos.create({ spotId, userId: req.user.sub, url });
    return res.status(201).json(photo);
}));

module.exports = router;
