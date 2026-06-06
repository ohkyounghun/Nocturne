const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const likesController = require('../controllers/likesController');
const spotsController = require('../controllers/spotsController');
const authenticate = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const spots = require('../models/spots');

/**
 * @swagger
 * /api/spots:
 *   get:
 *     summary: List all spots
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', asyncHandler(async (req, res) => {
    const rows = await spots.findAll();
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

module.exports = router;
