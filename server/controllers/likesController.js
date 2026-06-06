const likes = require("../models/likes");

function isDuplicateLikeError(error) {
    return error?.code === "SQLITE_CONSTRAINT"
        && error.message?.includes("UNIQUE constraint failed: likes.spot_id, likes.user_id");
}

function parseSpotId(req, res) {
    const spotId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(spotId)) {
        res.status(400).json({
            code: "INVALID_SPOT_ID",
            message: "Spot id must be a number"
        });
        return null;
    }

    return spotId;
}

async function create(req, res) {
    const spotId = parseSpotId(req, res);

    if (spotId === null) {
        return;
    }

    try {
        const like = await likes.create({
            spotId,
            userId: req.user.sub
        });

        return res.status(201).json(like);
    } catch (error) {
        // DB 고유 제약조건을 API의 명확한 중복 응답으로 변환한다.
        // Convert the DB unique constraint into an explicit duplicate response.
        if (isDuplicateLikeError(error)) {
            return res.status(409).json({
                code: "ALREADY_LIKED",
                message: "You already liked this spot"
            });
        }

        throw error;
    }
}

async function remove(req, res) {
    const spotId = parseSpotId(req, res);

    if (spotId === null) {
        return;
    }

    const deletedCount = await likes.delete({
        spotId,
        userId: req.user.sub
    });

    if (deletedCount === 0) {
        return res.status(404).json({
            code: "LIKE_NOT_FOUND",
            message: "Like not found"
        });
    }

    return res.status(204).send();
}

module.exports = {
    create,
    remove
};
