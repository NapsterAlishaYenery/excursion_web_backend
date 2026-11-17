// src/middlewares/rate-limiters/contact.limiter.js
const rateLimit = require('express-rate-limit');

/**
 * Para formulario de CONTACTO público (POST /email/contact).
 *
 * 5 mensajes / 1 HORA por IP. Muy estricto a propósito:
 * - Un humano legítimo no manda más de 5 mensajes en 1 hora.
 * - Bloquea bots que quieran inundar el correo del admin con spam.
 *
 * ⚠️ Solo usar en POST /email/contact.
 */
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    message: {
        ok: false,
        type: 'TooManyRequests',
        message: 'Too many contact messages. Please try again in 1 hour or reach us via WhatsApp.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS'
});

module.exports = contactLimiter;