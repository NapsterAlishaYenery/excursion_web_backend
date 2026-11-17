// src/middlewares/rate-limiters/global.limiter.js
const rateLimit = require('express-rate-limit');

/**
 * Backstop GLOBAL. Se aplica a TODAS las requests en server.js.
 * Es la última red de seguridad por si alguna ruta no tiene su limiter específico.
 * 500 req / 15 min por IP ≈ 33 req/min ≈ 0.55 req/s → suficiente para uso humano.
 *
 * ⚠️ NO usar en rutas individuales, solo en server.js.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        ok: false,
        type: 'TooManyRequests',
        message: 'You have made too many requests. Please wait 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS'
});

module.exports = globalLimiter;