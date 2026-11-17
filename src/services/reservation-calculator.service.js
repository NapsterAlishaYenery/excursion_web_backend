// src/services/reservation-calculator.service.js
const Excursion = require('../models/excursion.model');

/**
 * Valida que la excursión exista, esté publicada, y que el turno/fecha sean válidos.
 * Calcula el pricing desde el backend (NUNCA confiar en el front).
 */
const calculateReservationPricing = async ({ excursionId, shift, reservationDate, guests }) => {
    // 1. Buscar excursión
    const excursion = await Excursion.findById(excursionId);
    if (!excursion) {
        const err = new Error('Excursion not found');
        err.status = 404;
        err.type = 'NotFound';
        throw err;
    }
    if (!excursion.isPublished) {
        const err = new Error('Excursion is not available');
        err.status = 400;
        err.type = 'NotAvailable';
        throw err;
    }

    // 2. Validar que el turno esté disponible en la excursión
    if (!excursion.shifts.availableShifts.includes(shift)) {
        const err = new Error(
            `Shift "${shift}" is not available for this excursion. Available: ${excursion.shifts.availableShifts.join(', ')}`
        );
        err.status = 400;
        err.type = 'InvalidShift';
        throw err;
    }

    // 3. Validar día de la semana disponible
    const date = new Date(reservationDate);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getUTCDay()];

    const dayIsAvailable =
        excursion.availableDays.includes('week') ||
        excursion.availableDays.includes(dayName);

    if (!dayIsAvailable) {
        const err = new Error(
            `Excursion is not available on ${dayName}. Available days: ${excursion.availableDays.join(', ')}`
        );
        err.status = 400;
        err.type = 'InvalidDay';
        throw err;
    }

    // 4. Calcular pricing
    const { adultPrice, childPrice, infantPrice } = excursion.pricing;

    const adultsSubtotal = guests.adults * adultPrice;
    const childrenSubtotal = guests.children * childPrice;
    const infantsSubtotal = guests.infants * (infantPrice || 0); // 0 por defecto
    const total = adultsSubtotal + childrenSubtotal + infantsSubtotal;

    return {
        excursion,
        pricing: {
            adultUnitPrice: adultPrice,
            childUnitPrice: childPrice,
            infantUnitPrice: infantPrice || 0,
            adultsSubtotal,
            childrenSubtotal,
            infantsSubtotal,
            total,
            currency: 'USD'
        }
    };
};

module.exports = { calculateReservationPricing };