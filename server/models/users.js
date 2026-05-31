const { getDb } = require('../db/database');

async function findByEmail(email) {
    const db = getDb();
    return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

async function findByUsername(username) {
    const db = getDb();
    return db.get('SELECT * FROM users WHERE username = ?', [username]);
}

async function create({ email, password_hash, username }) {
    const db = getDb();
    const result = await db.run(
        'INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)',
        [email, password_hash, username]
    );
    return result.lastID;
}

module.exports = { findByEmail, findByUsername, create };