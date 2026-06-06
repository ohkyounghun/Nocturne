const bookmarks = require("../models/bookmarks");

function isDuplicateBookmarkError(error) {
    return error?.code === "SQLITE_CONSTRAINT"
        && error.message?.includes("UNIQUE constraint failed: bookmarks.spot_id, bookmarks.user_id");
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

async function getMyBookmarks(req, res) {
    const userBookmarks = await bookmarks.getByUser(req.user.sub);
    return res.status(200).json(userBookmarks);
}

async function create(req, res) {
    const spotId = parseSpotId(req, res);

    if (spotId === null) {
        return;
    }

    try {
        const bookmark = await bookmarks.create({
            spotId,
            userId: req.user.sub
        });

        return res.status(201).json(bookmark);
    } catch (error) {
        if (isDuplicateBookmarkError(error)) {
            return res.status(409).json({
                code: "ALREADY_BOOKMARKED",
                message: "You already bookmarked this spot"
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

    const deletedCount = await bookmarks.delete({
        spotId,
        userId: req.user.sub
    });

    if (deletedCount === 0) {
        return res.status(404).json({
            code: "BOOKMARK_NOT_FOUND",
            message: "Bookmark not found"
        });
    }

    return res.status(204).send();
}

module.exports = {
    getMyBookmarks,
    create,
    remove
};