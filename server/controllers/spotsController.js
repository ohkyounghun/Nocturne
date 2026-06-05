const { validationResult } = require('express-validator');
const Spots = require('../models/spots');

async function createSpot(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: errors.array()[0].msg,
        });
    }

    const { title, description, latitude, longitude } = req.body;
    const spot = await Spots.create({
        userId: req.user.sub,
        title,
        description,
        latitude,
        longitude,
    });
    return res.status(201).json(spot);
}

async function deleteSpot(req, res) {
    const { id } = req.params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid spot id' });
    }

    const spot = await Spots.findById(numId);
    if (!spot) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Spot not found' });
    }

    if (spot.user_id !== req.user.sub) {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'Not the owner of this spot' });
    }

    await Spots.delete({ spotId: numId, userId: req.user.sub });
    return res.status(204).send();
}

module.exports = { createSpot, deleteSpot };
