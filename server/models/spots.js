const { getDb } = require("../db/database");

async function findAll() {
    const db = getDb();
    return db.all(`SELECT * FROM spots ORDER BY created_at DESC`);
}

async function findById(id) {
    const db = getDb();
    return db.get(`SELECT * FROM spots WHERE id = ?`, [id]);
}

async function create({ userId, title, description, latitude, longitude }) {
    const db = getDb();
    const result = await db.run(
        `INSERT INTO spots (user_id, title, description, latitude, longitude)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, title, description ?? null, latitude, longitude]
    );
    return db.get(`SELECT * FROM spots WHERE id = ?`, [result.lastID]);
}

async function remove(id) {
    const db = getDb();
    const result = await db.run(`DELETE FROM spots WHERE id = ?`, [id]);
    return result.changes;
}

module.exports = { findAll, findById, create, delete: remove };
