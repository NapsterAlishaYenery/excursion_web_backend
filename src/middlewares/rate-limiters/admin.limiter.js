// src/middlewares/rate-limiters/admin.limiter.js
const rateLimit = require('express-rate-limit');

/**
 * Para GETs de ADMIN (dashboards, listados paginados, detalle por ID).
 * Ej: GET /reservations, GET /reservations/:id, GET /excursions/admin/:id
 *
 * 300 req / 15 min → el admin refresca el dashboard muchas veces, más permisivo.
 */
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        ok: false,
        type: 'TooManyRequests',
        message: 'Too many admin requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS'
});

module.exports = adminLimiter;