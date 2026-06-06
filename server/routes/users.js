const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const bookmarks = require('../models/bookmarks');
const likes = require('../models/likes');
const spots = require('../models/spots');

router.get('/me/bookmarks', authenticate, asyncHandler(async (req, res) => {
    const rows = await bookmarks.getByUser(req.user.sub);
    return res.json(rows);
}));

router.get('/me/likes', authenticate, asyncHandler(async (req, res) => {
    const rows = await likes.getByUser(req.user.sub);
    return res.json(rows);
}));

router.get('/me/spots', authenticate, asyncHandler(async (req, res) => {
    const rows = await spots.findByUser(req.user.sub);
    return res.json(rows);
}));

module.exports = router;
