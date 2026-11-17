// src/middlewares/rate-limiters/index.js
/**
 * Barrel export de todos los rate limiters.
 *
 * Uso:
 *   const { readLimiter, writeLimiter } = require('../middlewares/rate-limiters');
 *
 * Regla mental para elegir cuál usar en cada endpoint:
 *
 *  ┌──────────────────────────────┬──────────────────────┐
 *  │ Endpoint                     │ Limiter              │
 *  ├──────────────────────────────┼──────────────────────┤
 *  │ GET público (listar, slug)   │ readLimiter          │
 *  │ GET admin (dash, detalle ID) │ adminLimiter         │
 *  │ POST/PATCH/DELETE admin      │ writeLimiter         │
 *  │ POST /reservations (público) │ reservationLimiter   │
 *  │ POST login / registro        │ authLimiter          │
 *  │ server.js (global backstop)  │ globalLimiter        │
 *  └──────────────────────────────┴──────────────────────┘
 */
const globalLimiter = require('./global.limiter');
const readLimiter = require('./read.limiter');
const writeLimiter = require('./write.limiter');
const adminLimiter = require('./admin.limiter');
const reservationLimiter = require('./reservation.limiter');
const authLimiter = require('./auth.limiter');
const contactLimiter = require('./contact.limiter');

module.exports = {
    globalLimiter,
    readLimiter,
    writeLimiter,
    adminLimiter,
    reservationLimiter,
    authLimiter,
    contactLimiter
};