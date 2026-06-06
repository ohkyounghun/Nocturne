const { getDb } = require("../db/database");

const SPOT_COLS = `
    s.*,
    (SELECT COUNT(*) FROM likes    WHERE spot_id = s.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE spot_id = s.id) AS comment_count,
    (SELECT url FROM photos WHERE spot_id = s.id ORDER BY created_at ASC LIMIT 1) AS image_url
`;

// Returns top 10 spots for the card list
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

// Returns all spots (no LIMIT) for the map — includes easter egg spots
async function findAllForMap(tag) {
    const db = getDb();

    if (tag) {
        return db.all(
            `
            SELECT ${SPOT_COLS}
            FROM spots s
            WHERE LOWER(s.season_tag) = LOWER(?)
               OR LOWER(s.weather_tag) = LOWER(?)
            ORDER BY s.id DESC
            `,
            [tag, tag]
        );
    }

    return db.all(`SELECT ${SPOT_COLS} FROM spots s ORDER BY s.id DESC`);
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

module.exports = { findAll, findAllForMap, findById, create, delete: remove };
