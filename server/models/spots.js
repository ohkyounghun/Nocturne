const { getDb } = require("../db/database");

const SPOT_COLS = `
    s.*,
    (SELECT COUNT(*) FROM likes    WHERE spot_id = s.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE spot_id = s.id) AS comment_count
`;

async function findAll() {
    const db = getDb();
    return db.all(`SELECT ${SPOT_COLS} FROM spots s ORDER BY s.created_at DESC`);
}

async function findById(id) {
    const db = getDb();
    return db.get(`SELECT ${SPOT_COLS} FROM spots s WHERE s.id = ?`, [id]);
}

async function create({ userId, title, description, latitude, longitude, seasonTag, weatherTag }) {
    const db = getDb();
    const result = await db.run(
        `INSERT INTO spots (user_id, title, description, latitude, longitude, season_tag, weather_tag)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, title, description ?? null, latitude, longitude, seasonTag ?? null, weatherTag ?? null]
    );
    return findById(result.lastID);
}

async function remove(id) {
    const db = getDb();
    const result = await db.run(`DELETE FROM spots WHERE id = ?`, [id]);
    return result.changes;
}

module.exports = { findAll, findById, create, delete: remove };
