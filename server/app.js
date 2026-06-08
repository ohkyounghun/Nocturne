require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const spotsRouter = require('./routes/spots');
const authRouter = require("./routes/auth");
const usersRouter = require('./routes/users');

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc:  ["'self'"],
            scriptSrc:   ["'self'", "'unsafe-inline'", 'dapi.kakao.com', '*.kakao.com', '*.daumcdn.net'],
            styleSrc:    ["'self'", "'unsafe-inline'"],
            frameSrc:    ["'none'"],
            objectSrc:   ["'none'"],
            imgSrc:      ["'self'", 'data:', '*.kakao.com', '*.daumcdn.net'],
            connectSrc:  ["'self'", 'dapi.kakao.com', '*.kakao.com'],
        },
    },
}));
app.use(express.json());

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, '../client')));

// Serve uploaded images — set explicit headers to prevent script execution
app.use('/uploads', (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Swagger UI (interactive docs) + raw OpenAPI spec endpoint
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/openapi.json', (req, res) => res.json(swaggerSpec));

// Throttle auth endpoints to slow down brute-force / credential-stuffing attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                  // 20 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, please try again later.' }
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/spots', spotsRouter);
app.use('/api/users', usersRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' });
});

module.exports = app;
