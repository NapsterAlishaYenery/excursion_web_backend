// src/middlewares/reservation-validator.middleware.js
const Joi = require('joi');

// Schema para CREATE (público)
const createReservationSchema = Joi.object({
    excursionId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'any.required': 'Excursion ID is required',
            'string.pattern.base': 'Invalid excursion ID format'
        }),

    shift: Joi.string()
        .valid('morning', 'afternoon', 'night')
        .required()
        .messages({
            'any.required': 'Shift is required',
            'any.only': 'Shift must be one of: morning, afternoon, night'
        }),

    reservationDate: Joi.date()
        .iso()
        .greater('now')
        .required()
        .messages({
            'date.greater': 'Reservation date must be in the future',
            'any.required': 'Reservation date is required'
        }),

    guests: Joi.object({
        adults: Joi.number().integer().min(1).max(20).required(),
        children: Joi.number().integer().min(0).max(20).default(0),
        infants: Joi.number().integer().min(0).max(10).default(0)
    }).required(),

    customer: Joi.object({
        fullName: Joi.string().min(3).max(120).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().min(6).max(30).required(),
        country: Joi.string().max(80).optional().allow(''),
        preferredLanguage: Joi.string().valid('es', 'en', 'bg').default('es')
    }).required(),

    logistics: Joi.object({
        hotelName: Joi.string().max(200).optional().allow(''),
        roomNumber: Joi.string().max(50).optional().allow(''),
        pickupNotes: Joi.string().max(500).optional().allow(''),
        specialRequests: Joi.string().max(1000).optional().allow('')
    }).default({}),

    // ⚠️ NO permitimos que el front mande precios ni status
    pricing: Joi.any().forbidden(),
    status: Joi.any().forbidden(),
    bookingCode: Joi.any().forbidden(),
    payment: Joi.any().forbidden(),
    adminNotes: Joi.any().forbidden()
});

// Schema para UPDATE por admin (solo ciertos campos)
const updateReservationSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'paid', 'cancelled', 'completed', 'no_show')
        .optional(),
    payment: Joi.object({
        method: Joi.string().valid('cash', 'transfer', 'card', 'paypal', 'stripe', 'none'),
        status: Joi.string().valid('unpaid', 'partial', 'paid', 'refunded'),
        reference: Joi.string().max(200).allow(''),
        paidAmount: Joi.number().min(0),
        paidAt: Joi.date(),
        notes: Joi.string().max(500).allow('')
    }).optional(),
    adminNotes: Joi.string().max(2000).allow('').optional(),
    cancellationReason: Joi.string().max(500).allow('').optional(),
    logistics: Joi.object({
        hotelName: Joi.string().max(200).allow(''),
        roomNumber: Joi.string().max(50).allow(''),
        pickupNotes: Joi.string().max(500).allow(''),
        specialRequests: Joi.string().max(1000).allow('')
    }).optional(),
    // ⚠️ NO se puede editar: excursion, guests, pricing, customer.email, bookingCode
    excursionId: Joi.any().forbidden(),
    guests: Joi.any().forbidden(),
    pricing: Joi.any().forbidden(),
    bookingCode: Joi.any().forbidden()
}).min(1);

const validateReservation = {
    create: (req, res, next) => {
        const { error, value } = createReservationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: error.details.map(d => d.message)
            });
        }
        req.body = value;
        next();
    },
    update: (req, res, next) => {
        const { error, value } = updateReservationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: error.details.map(d => d.message)
            });
        }
        req.body = value;
        next();
    }
};

module.exports = validateReservation;