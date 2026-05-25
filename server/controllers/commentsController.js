const comments = require("../models/comments");

async function listBySpot(req, res) {
    const spotId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(spotId)) {
        return res.status(400).json({
            code: "INVALID_SPOT_ID",
            message: "Spot id must be a number"
        });
    }

    const rows = await comments.getBySpot(spotId);
    return res.json(rows);
}

module.exports = {
    listBySpot
};
