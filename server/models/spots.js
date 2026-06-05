const { getDb } = require('../db/database');

async function create({ userId, title, description, latitude, longitude }) {
    const db = getDb();
    const result = await db.run(
        `INSERT INTO spots (user_id, title, description, latitude, longitude)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, title, description, latitude, longitude]
    );
    return db.get(`SELECT * FROM spots WHERE id = ?`, [result.lastID]);
}

async function findById(id) {
    const db = getDb();
    return db.get(`SELECT * FROM spots WHERE id = ?`, [id]);
}

async function remove({ spotId, userId }) {
    const db = getDb();
    const result = await db.run(
        `DELETE FROM spots WHERE id = ? AND user_id = ?`,
        [spotId, userId]
    );
    return result.changes;
}

module.exports = { create, findById, delete: remove };
