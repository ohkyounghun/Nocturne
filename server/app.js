require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDb } = require('./db/database');
const spotsRouter = require('./routes/spots');
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, '../client')));

app.use('/api/spots', spotsRouter);

app.use('/api/auth', authRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' });
});

async function start() {
    await initDb();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    })
}

start();

module.exports = app;