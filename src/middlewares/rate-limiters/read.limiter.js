// src/middlewares/rate-limiters/read.limiter.js
const rateLimit = require('express-rate-limit');

/**
 * Para GETs PÚBLICOS (listados, detalle por slug, etc.).
 * Ej: GET /excursions, GET /excursions/public/:slug, GET /reservations/code/:code
 *
 * 200 req / 15 min ≈ 13 req/min → suficiente para navegación humana normal.
 */
const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        ok: false,
        type: 'TooManyRequests',
        message: 'Too many read requests. Please wait a few minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS'
});

module.exports = readLimiter;