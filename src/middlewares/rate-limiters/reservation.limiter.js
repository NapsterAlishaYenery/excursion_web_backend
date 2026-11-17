// src/middlewares/rate-limiters/reservation.limiter.js
const rateLimit = require('express-rate-limit');

/**
 * Para CREACIÓN de reservas (POST /reservations — público).
 *
 * 10 reservas / 1 HORA por IP. Muy estricto a propósito:
 * - Un humano real no hace más de 10 reservas en 1 hora.
 * - Bloquea bots que quieran spamear reservas falsas.
 *
 * ⚠️ Solo usar en el endpoint POST /reservations (público).
 *    NO usar en el resto de rutas de reservas.
 */
const reservationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10,
    message: {
        ok: false,
        type: 'TooManyRequests',
        message: 'Too many reservation attempts. Please try again in 1 hour or contact us via WhatsApp.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS'
});

module.exports = reservationLimiter;