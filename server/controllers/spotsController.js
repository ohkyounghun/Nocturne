const spots = require("../models/spots");

async function create(req, res) {
    const { title, description, latitude, longitude } = req.body ?? {};

    if (!title || !description || latitude == null || longitude == null) {
        return res.status(400).json({
            code: "VALIDATION_ERROR",
            message: "title, description, latitude, longitude are required"
        });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.status(400).json({
            code: "VALIDATION_ERROR",
            message: "latitude and longitude must be numbers"
        });
    }

    const spot = await spots.create({
        userId: req.user.id,
        title,
        description,
        latitude: lat,
        longitude: lng
    });

    return res.status(201).json(spot);
}

async function remove(req, res) {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            code: "INVALID_SPOT_ID",
            message: "Spot id must be a number"
        });
    }

    const spot = await spots.findById(id);

    if (!spot) {
        return res.status(404).json({
            code: "NOT_FOUND",
            message: "Spot not found"
        });
    }

    if (spot.user_id !== req.user.id) {
        return res.status(403).json({
            code: "FORBIDDEN",
            message: "You are not the owner of this spot"
        });
    }

    await spots.delete(id);
    return res.status(204).send();
}

module.exports = { create, remove };
