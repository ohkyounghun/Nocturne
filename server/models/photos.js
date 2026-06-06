const { getDb } = require('../db/database');

async function create({ spotId, userId, url }) {
    const db = getDb();
    const result = await db.run(
        `INSERT INTO photos (spot_id, user_id, url) VALUES (?, ?, ?)`,
        [spotId, userId, url]
    );
    return db.get(`SELECT * FROM photos WHERE id = ?`, [result.lastID]);
}

async function getBySpot(spotId) {
    const db = getDb();
    return db.all(`SELECT * FROM photos WHERE spot_id = ? ORDER BY created_at DESC`, [spotId]);
}

module.exports = { create, getBySpot };
