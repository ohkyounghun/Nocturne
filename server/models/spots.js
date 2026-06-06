const { getDb } = require("../db/database");

const SPOT_COLS = `
    s.*,
    (SELECT COUNT(*) FROM likes    WHERE spot_id = s.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE spot_id = s.id) AS comment_count,
    (SELECT url FROM photos WHERE spot_id = s.id ORDER BY created_at ASC LIMIT 1) AS image_url
`;

async function findAll(tag) {
    const db = getDb();

    if (tag) {
        return db.all(
            `
            SELECT ${SPOT_COLS}
            FROM spots s
            WHERE LOWER(s.season_tag) = LOWER(?)
               OR LOWER(s.weather_tag) = LOWER(?)
            ORDER BY s.id DESC
            LIMIT 10
            `,
            [tag, tag]
        );
    }

    return db.all(`SELECT ${SPOT_COLS} FROM spots s ORDER BY s.id DESC LIMIT 10`);
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

async function findByUser(userId) {
    const db = getDb();
    return db.all(`SELECT ${SPOT_COLS} FROM spots s WHERE s.user_id = ? ORDER BY s.id DESC`, [userId]);
}

async function update(id, { title, description, seasonTag, weatherTag }) {
    const db = getDb();
    await db.run(
        `UPDATE spots SET title = ?, description = ?, season_tag = ?, weather_tag = ? WHERE id = ?`,
        [title, description ?? null, seasonTag ?? null, weatherTag ?? null, id]
    );
    return findById(id);
}

async function remove(id) {
    const db = getDb();
    const result = await db.run(`DELETE FROM spots WHERE id = ?`, [id]);
    return result.changes;
}

module.exports = { findAll, findById, findByUser, create, update, delete: remove };
