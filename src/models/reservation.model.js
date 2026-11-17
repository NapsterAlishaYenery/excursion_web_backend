// src/models/reservation.model.js
const { Schema, model } = require('mongoose');

// ============================================================
// SUB-SCHEMAS
// ============================================================

// Huéspedes por categoría
const GuestCountSchema = new Schema({
    adults: { type: Number, default: 1, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 }
}, { _id: false });

// Snapshot del precio al momento de reservar
// (NO confiamos en el front; el back lo calcula y lo guarda)
const PriceBreakdownSchema = new Schema({
    adultUnitPrice: { type: Number, required: true, min: 0 },
    childUnitPrice: { type: Number, required: true, min: 0 },
    infantUnitPrice: { type: Number, default: 0, min: 0 },
    adultsSubtotal: { type: Number, required: true, min: 0 },
    childrenSubtotal: { type: Number, required: true, min: 0 },
    infantsSubtotal: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true }
}, { _id: false });

// Datos del cliente
const CustomerSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Customer full name is required'],
        trim: true,
        maxlength: 120
    },
    email: {
        type: String,
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    phone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true
    },
    country: { type: String, trim: true },
    preferredLanguage: {
        type: String,
        enum: ['es', 'en', 'bg'],
        default: 'es'
    }
}, { _id: false });

// Datos logísticos (hotel, room, etc.)
const LogisticsSchema = new Schema({
    hotelName: { type: String, trim: true },
    roomNumber: { type: String, trim: true },
    pickupNotes: { type: String, trim: true, maxlength: 500 },
    specialRequests: { type: String, trim: true, maxlength: 1000 }
}, { _id: false });

// ============================================================
// SCHEMA PRINCIPAL
// ============================================================
const ReservationSchema = new Schema({

    // ========================================
    // IDENTIFICACIÓN
    // ========================================
    bookingCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
        trim: true
        // Se genera en pre('validate'), ej: 'MRN-2026-A1B2C3'
    },

    // ========================================
    // EXCURSIÓN RESERVADA
    // ========================================
    excursion: {
        type: Schema.Types.ObjectId,
        ref: 'excursion',
        required: [true, 'Excursion is required'],
        index: true
    },
    // Snapshot del nombre para que si la excursión se borra/renombra,
    // la reserva mantenga el nombre histórico
    excursionSnapshot: {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        durationLabel: { type: String },  // ej: "5 hours"
    },

    // ========================================
    // TURNO Y FECHA
    // ========================================
    shift: {
        type: String,
        enum: {
            values: ['morning', 'afternoon', 'night'],
            message: 'Shift must be one of: morning, afternoon, night'
        },
        required: [true, 'Shift is required']
    },
    reservationDate: {
        type: Date,
        required: [true, 'Reservation date is required'],
        index: true
    },

    // ========================================
    // HUÉSPEDES Y PRECIOS
    // ========================================
    guests: {
        type: GuestCountSchema,
        required: true
    },
    pricing: {
        type: PriceBreakdownSchema,
        required: true
    },

    // ========================================
    // CLIENTE Y LOGÍSTICA
    // ========================================
    customer: {
        type: CustomerSchema,
        required: true
    },
    logistics: {
        type: LogisticsSchema,
        default: {}
    },

    // ========================================
    // ESTADO
    // ========================================
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'paid', 'cancelled', 'completed', 'no_show'],
            message: 'Invalid status'
        },
        default: 'pending',
        index: true
    },

    // ========================================
    // PAGO (preparado para pasarela futura)
    // ========================================
    payment: {
        method: {
            type: String,
            enum: ['cash', 'transfer', 'card', 'paypal', 'stripe', 'none'],
            default: 'none'
        },
        status: {
            type: String,
            enum: ['unpaid', 'partial', 'paid', 'refunded'],
            default: 'unpaid'
        },
        reference: { type: String, trim: true },      // ID de transacción Stripe/PayPal
        paidAmount: { type: Number, default: 0, min: 0 },
        paidAt: { type: Date },
        notes: { type: String, trim: true, maxlength: 500 }
    },

    // ========================================
    // NOTAS INTERNAS (solo admin)
    // ========================================
    adminNotes: {
        type: String,
        trim: true,
        maxlength: 2000
    },

    // ========================================
    // METADATOS
    // ========================================
    source: {
        type: String,
        enum: ['web', 'whatsapp', 'phone', 'walk_in', 'admin'],
        default: 'web'
    },
    ipAddress: { type: String, trim: true },   // para auditoría/anti-spam
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    cancelledAt: { type: Date }

}, {
    versionKey: false,
    timestamps: true
});

// ============================================================
// HOOKS
// ============================================================

// Generar bookingCode único
ReservationSchema.pre('validate', async function () {
    if (this.isNew && !this.bookingCode) {
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.bookingCode = `MRN-${year}-${random}`;
    }
});

// ============================================================
// ÍNDICES
// ============================================================
ReservationSchema.index({ createdAt: -1 });
ReservationSchema.index({ 'customer.email': 1 });
ReservationSchema.index({ 'customer.phone': 1 });
ReservationSchema.index({ status: 1, reservationDate: 1 });
ReservationSchema.index({ excursion: 1, reservationDate: 1 });

// ============================================================
// VIRTUALS (útiles para respuestas)
// ============================================================
ReservationSchema.virtual('totalGuests').get(function () {
    return this.guests.adults + this.guests.children + this.guests.infants;
});

ReservationSchema.set('toJSON', { virtuals: true });
ReservationSchema.set('toObject', { virtuals: true });

module.exports = model('reservation', ReservationSchema);