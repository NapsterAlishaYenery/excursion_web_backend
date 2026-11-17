// src/constants/reservation.constants.js

const RESERVATION_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PAID: 'paid',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    NO_SHOW: 'no_show'
};

const RESERVATION_STATUS_LABELS = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    paid: 'Pagada',
    cancelled: 'Cancelada',
    completed: 'Completada',
    no_show: 'No se presentó'
};

const PAYMENT_METHODS = {
    CASH: 'cash',
    TRANSFER: 'transfer',
    CARD: 'card',
    PAYPAL: 'paypal',
    STRIPE: 'stripe',
    NONE: 'none'
};

const PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PARTIAL: 'partial',
    PAID: 'paid',
    REFUNDED: 'refunded'
};

module.exports = {
    RESERVATION_STATUS,
    RESERVATION_STATUS_LABELS,
    PAYMENT_METHODS,
    PAYMENT_STATUS
};