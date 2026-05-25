const { getDb } = require("../db/database");

async function getBySpot(spotId) {
    const db = getDb();

    return db.all(
        `
        SELECT
            comments.id,
            comments.spot_id,
            comments.user_id,
            comments.content,
            comments.created_at,
            users.username
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.spot_id = ?
        ORDER BY comments.created_at ASC, comments.id ASC
        `,
        [spotId]
    );
}

async function create({ spotId, userId, content }) {
    const db = getDb();
    const result = await db.run(
        `
        INSERT INTO comments (spot_id, user_id, content)
        VALUES (?, ?, ?)
        `,
        [spotId, userId, content]
    );

    return db.get(
        `
        SELECT
            comments.id,
            comments.spot_id,
            comments.user_id,
            comments.content,
            comments.created_at,
            users.username
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.id = ?
        `,
        [result.lastID]
    );
}

async function remove({ commentId, userId }) {
    const db = getDb();
    const result = await db.run(
        `
        DELETE FROM comments
        WHERE id = ? AND user_id = ?
        `,
        [commentId, userId]
    );

    return result.changes;
}

module.exports = {
    getBySpot,
    create,
    delete: remove
};
