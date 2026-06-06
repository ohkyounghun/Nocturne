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

async function create(req, res) {
    const spotId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(spotId)) {
        return res.status(400).json({
            code: "INVALID_SPOT_ID",
            message: "Spot id must be a number"
        });
    }

    const content = req.body?.content?.trim();

    // 공백만 있는 댓글은 데이터베이스에 저장하지 않는다.
    // Do not store comments that contain only whitespace.
    if (!content) {
        return res.status(400).json({
            code: "VALIDATION_ERROR",
            message: "Comment content is required"
        });
    }

    const comment = await comments.create({
        spotId,
        userId: req.user.sub,
        content
    });

    return res.status(201).json(comment);
}

async function remove(req, res) {
    const spotId = Number.parseInt(req.params.spotId, 10);
    const commentId = Number.parseInt(req.params.commentId, 10);

    if (Number.isNaN(spotId) || Number.isNaN(commentId)) {
        return res.status(400).json({
            code: "INVALID_COMMENT_PATH",
            message: "Spot id and comment id must be numbers"
        });
    }

    const deletedCount = await comments.delete({
        spotId,
        commentId,
        userId: req.user.sub
    });

    if (deletedCount === 0) {
        return res.status(404).json({
            code: "COMMENT_NOT_FOUND",
            message: "Comment not found or not owned by this user"
        });
    }

    return res.status(204).send();
}

module.exports = {
    listBySpot,
    create,
    remove
};
