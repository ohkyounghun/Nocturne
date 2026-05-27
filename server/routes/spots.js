const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

// 비동기 라우트 에러를 Express 에러 핸들러로 넘긴다.
// Forward async route errors to the Express error handler.
function asyncHandler(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

/**
 * @swagger
 * /api/spots:
 *   get:
 *     summary: List all spots
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', (req, res) => {
    res.json([
        { id: 1, title: 'seoultech', latitude: 37.55, longitude: 126.98 },
        { id: 2, title: 'boongabang', latitude: 34.55, longitude: 132.98 }
    ])
});

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
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const numId = parseInt(id);
    if (numId > 3) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Spot not found' });
    }
    // Simulate fetching a spot by ID
    res.json({ id: numId, title: 'spot name', latitude: 37.55, longitude: 126.98 });
});


module.exports = router;
