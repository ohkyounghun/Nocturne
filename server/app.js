const express = require('express');
const path = require('path');
const { initDb } = require('./db/database');
const spotsRouter = require('./routes/spots');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, '../client')));

app.use('/api/spots', spotsRouter);

async function start() {
    await initDb();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    })
}

start();

module.exports = app;