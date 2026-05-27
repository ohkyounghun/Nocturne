const { getDb } = require("../db/database");

async function getBySpot(spotId) {
    const db = getDb();

    return db.all(
        `
        SELECT
            likes.id,
            likes.spot_id,
            likes.user_id,
            users.username
        FROM likes
        JOIN users ON likes.user_id = users.id
        WHERE likes.spot_id = ?
        ORDER BY likes.id ASC
        `,
        [spotId]
    );
}

async function create({ spotId, userId }) {
    const db = getDb();
    const result = await db.run(
        `
        INSERT INTO likes (spot_id, user_id)
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
        DELETE FROM likes
        WHERE spot_id = ? AND user_id = ?
        `,
        [spotId, userId]
    );

    return result.changes;
}

module.exports = {
    getBySpot,
    create,
    delete: remove
};
