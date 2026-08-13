// src/utils/price.validator.js
/**
 * Valida que un precio sea un número positivo (incluyendo 0)
 * @param {number} value - Precio a validar
 * @returns {boolean}
 */
const priceValidator = (value) => {
    return typeof value === 'number' && value >= 0;
};

module.exports = priceValidator;