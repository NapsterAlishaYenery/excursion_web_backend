// src/controllers/reservation.controller.js
const Reservation = require('../models/reservation.model');
const { calculateReservationPricing } = require('../services/reservation-calculator.service');
const { sendMailService } = require('../services/email.service');
const { makeHtmlForReservationClient, makeHtmlForReservationAdmin } = require('../templates/reservation.template');
const { RESERVATION_STATUS } = require('../constants/reservation.constants');

// ============================================================
// CREATE - Público
// ============================================================
exports.createReservation = async (req, res) => {
    try {
        const { excursionId, shift, reservationDate, guests, customer, logistics } = req.body;

        // 1. Calcular pricing en backend (fuente de verdad)
        const { excursion, pricing } = await calculateReservationPricing({
            excursionId, shift, reservationDate, guests
        });

        // 2. Crear reserva
        const reservation = await Reservation.create({
            excursion: excursion._id,
            excursionSnapshot: {
                name: excursion.name,
                slug: excursion.slug,
                durationLabel: `${excursion.duration.value} ${excursion.duration.unit}`
            },
            shift,
            reservationDate: new Date(reservationDate),
            guests,
            pricing,
            customer,
            logistics,
            ipAddress: req.ip,
            source: 'web',
            status: RESERVATION_STATUS.PENDING
        });

        // 3. Enviar emails (no bloqueante: si falla el email, la reserva queda igual)
        try {
            // Email al cliente (factura)
            await sendMailService({
                to: customer.email,
                subject: `✅ Reservation Confirmed - ${reservation.bookingCode}`,
                html: makeHtmlForReservationClient(reservation)
            });

            // Email al admin (notificación + tabla)
            await sendMailService({
                to: process.env.EMAIL_SENDER,
                subject: `🔔 New Reservation - ${reservation.bookingCode} - ${customer.fullName}`,
                html: makeHtmlForReservationAdmin(reservation)
            });
        } catch (emailError) {
            console.error('⚠️ Reservation created but email failed:', emailError.message);
            // No rompemos la reserva por un fallo de email
        }

        res.status(201).json({
            ok: true,
            data: reservation,
            message: 'Reservation created successfully'
        });

    } catch (error) {
        console.error('--- CREATE RESERVATION ERROR ---', error);
        res.status(error.status || 500).json({
            ok: false,
            type: error.type || 'ServerError',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================================
// GET ALL - Admin (con filtros y paginación)
// ============================================================
exports.getAllReservations = async (req, res) => {
    try {
        const { status, search, from, to } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const query = {};

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { bookingCode: { $regex: search, $options: 'i' } },
                { 'customer.fullName': { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } },
                { 'customer.phone': { $regex: search, $options: 'i' } }
            ];
        }
        if (from || to) {
            query.reservationDate = {};
            if (from) query.reservationDate.$gte = new Date(from);
            if (to) query.reservationDate.$lte = new Date(to);
        }

        const [reservations, totalItems] = await Promise.all([
            Reservation.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Reservation.countDocuments(query)
        ]);

        res.json({
            ok: true,
            data: reservations,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                hasNextPage: page < Math.ceil(totalItems / limit),
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('--- GET ALL RESERVATIONS ERROR ---', error);
        res.status(500).json({ ok: false, type: 'ServerError', message: 'Internal Server Error' });
    }
};

// ============================================================
// GET BY ID - Admin
// ============================================================
exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('excursion', 'name slug images');
        if (!reservation) {
            return res.status(404).json({ ok: false, type: 'NotFound', message: 'Reservation not found' });
        }
        res.json({ ok: true, data: reservation });
    } catch (error) {
        console.error('--- GET RESERVATION BY ID ERROR ---', error);
        res.status(500).json({ ok: false, type: 'ServerError', message: 'Internal Server Error' });
    }
};

// ============================================================
// GET BY BOOKING CODE - Público (para que el cliente consulte)
// ============================================================
exports.getReservationByCode = async (req, res) => {
    try {
        const reservation = await Reservation.findOne({ bookingCode: req.params.code });
        if (!reservation) {
            return res.status(404).json({ ok: false, type: 'NotFound', message: 'Reservation not found' });
        }
        res.json({ ok: true, data: reservation });
    } catch (error) {
        console.error('--- GET RESERVATION BY CODE ERROR ---', error);
        res.status(500).json({ ok: false, type: 'ServerError', message: 'Internal Server Error' });
    }
};

// ============================================================
// UPDATE - Admin (solo estado, pago, notas)
// ============================================================
exports.updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ ok: false, type: 'NotFound', message: 'Reservation not found' });
        }

        const allowedFields = ['status', 'payment', 'adminNotes', 'logistics', 'cancellationReason'];

        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                if (key === 'payment' || key === 'logistics') {
                    reservation[key] = { ...reservation[key]?.toObject?.() ?? reservation[key] ?? {}, ...req.body[key] };
                } else {
                    reservation[key] = req.body[key];
                }
            }
        }

        // Si se cancela, registrar cuándo
        if (req.body.status === 'cancelled' && !reservation.cancelledAt) {
            reservation.cancelledAt = new Date();
        }

        await reservation.save();

        res.json({ ok: true, data: reservation, message: 'Reservation updated successfully' });

    } catch (error) {
        console.error('--- UPDATE RESERVATION ERROR ---', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: Object.values(error.errors).map(e => e.message)
            });
        }
        res.status(500).json({ ok: false, type: 'ServerError', message: 'Internal Server Error' });
    }
};

// ============================================================
// DELETE - Admin
// ============================================================
exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) {
            return res.status(404).json({ ok: false, type: 'NotFound', message: 'Reservation not found' });
        }
        res.json({ ok: true, message: `Reservation ${reservation.bookingCode} deleted` });
    } catch (error) {
        console.error('--- DELETE RESERVATION ERROR ---', error);
        res.status(500).json({ ok: false, type: 'ServerError', message: 'Internal Server Error' });
    }
};