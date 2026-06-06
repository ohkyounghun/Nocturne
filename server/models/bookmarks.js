const { getDb } = require("../db/database");

async function getByUser(userId) {
    const db = getDb();

    return db.all(
        `
        SELECT
            bookmarks.id,
            bookmarks.spot_id,
            bookmarks.user_id,
            spots.title,
            spots.latitude,
            spots.longitude,
            (SELECT url FROM photos WHERE spot_id = spots.id ORDER BY created_at ASC LIMIT 1) AS image_url
        FROM bookmarks
        JOIN spots ON bookmarks.spot_id = spots.id
        WHERE bookmarks.user_id = ?
        ORDER BY bookmarks.id DESC
        `,
        [userId]
    );
}

async function create({ spotId, userId }) {
    const db = getDb();
    const result = await db.run(
        `
        INSERT INTO bookmarks (spot_id, user_id)
        VALUES (?, ?)
        `,
        [spotId, userId]
    );

    return {
        id: result.lastID,
        spot_id: spotId,
        user_id: userId
    };
}

async function remove({ spotId, userId }) {
    const db = getDb();
    const result = await db.run(
        `
        DELETE FROM bookmarks
        WHERE spot_id = ? AND user_id = ?
        `,
        [spotId, userId]
    );

    return result.changes;
}

module.exports = {
    getByUser,
    create,
    delete: remove
};