require('dotenv').config();
const express = require('express');
const path = require('path');
const spotsRouter = require('./routes/spots');
const authRouter = require("./routes/auth");
const bookmarksRouter = require('./routes/bookmarks');

const app = express();

app.use(express.json());

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, '../client')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/spots', spotsRouter);

app.use('/api/auth', authRouter);

app.use('/api/users/me/bookmarks', bookmarksRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' });
});

module.exports = app;
