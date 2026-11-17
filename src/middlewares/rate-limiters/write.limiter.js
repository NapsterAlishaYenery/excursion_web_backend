// src/middlewares/rate-limiters/write.limiter.js
const rateLimit = require('express-rate-limit');

/**
 * Para ESCRITURAS admin (POST/PATCH/DELETE en recursos gestionados).
 * Ej: POST /excursions, PATCH /excursions/:id, DELETE /excursions/admin/:id,
 *     PATCH /reservations/:id, DELETE /reservations/:id
 *
 * 50 req / 15 min → suficiente para un admin trabajando.
 */
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        ok: false,
        type: 'TooManyRequests',
        message: 'Too many write or edit requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS'
});

module.exports = writeLimiter;