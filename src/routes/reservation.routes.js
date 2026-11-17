// src/routes/reservation.routes.js
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const validateReservation = require('../middlewares/reservation-validator.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const isAdminMiddleware = require('../middlewares/isAdmin.middleware');
const { reservationLimiter, adminLimiter, writeLimiter, readLimiter } = require('../middlewares/rate-limiters');
const validateId = require('../middlewares/validate-id.middleware');


// ========================================
// RUTAS PÚBLICAS (Sin autenticación)
// ========================================

/**
 * @route   POST /api/reservations
 * @desc    Crear una nueva reserva (público)
 * @access  Público
 * @body    { excursionId, shift, reservationDate, guests, customer, logistics }
 */
router.post(
    '/',
    reservationLimiter,
    validateReservation.create,
    reservationController.createReservation
);

/**
 * @route   GET /api/reservations/code/:code
 * @desc    Obtener una reserva por su booking code (público)
 * @access  Público
 * @note    Para que el cliente consulte el estado de su reserva
 */
router.get(
    '/code/:code',
    readLimiter,
    reservationController.getReservationByCode
);


// ========================================
// RUTAS ADMIN (Requieren autenticación)
// ========================================

/**
 * @route   GET /api/reservations
 * @desc    Listar todas las reservas (con filtros y paginación)
 * @access  Admin
 * @query   status, search, from, to, page, limit
 */
router.get(
    '/',
    authMiddleware,
    isAdminMiddleware,
    adminLimiter,
    reservationController.getAllReservations
);

/**
 * @route   GET /api/reservations/:id
 * @desc    Obtener una reserva por ID
 * @access  Admin
 */
router.get(
    '/:id',
    authMiddleware,
    isAdminMiddleware,
    adminLimiter,
    validateId.id,
    reservationController.getReservationById
);

/**
 * @route   PATCH /api/reservations/:id
 * @desc    Actualizar una reserva (solo estado, pago, notas, logística)
 * @access  Admin
 * @body    { status?, payment?, adminNotes?, logistics?, cancellationReason? }
 */
router.patch(
    '/:id',
    authMiddleware,
    isAdminMiddleware,
    writeLimiter,
    validateId.id,
    validateReservation.update,
    reservationController.updateReservation
);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Eliminar una reserva
 * @access  Admin
 */
router.delete(
    '/:id',
    authMiddleware,
    isAdminMiddleware,
    writeLimiter,
    validateId.id,
    reservationController.deleteReservation
);


module.exports = router;