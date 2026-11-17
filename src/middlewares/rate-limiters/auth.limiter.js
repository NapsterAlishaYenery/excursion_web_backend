// src/middlewares/rate-limiters/auth.limiter.js
const rateLimit = require('express-rate-limit');

/**
 * Para LOGIN y REGISTRO. Previene fuerza bruta y creación masiva de cuentas.
 * Ej: POST /users/login, POST /users (registro)
 *
 * 5 intentos / 15 min por IP → un humano legítimo nunca se pasa.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        ok: false,
        type: 'TooManyRequests',
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS'
});

module.exports = authLimiter;