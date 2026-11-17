const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const { contactLimiter } = require('../middlewares/rate-limiters');

/**
 * @route   POST /api/email/contact
 * @desc    Enviar correo de contacto
 * @access  Público
 * @body    { fullName, email, phone, message }
 */
router.post(
    '/contact',
    contactLimiter,
    emailController.sendContactEmail
);

module.exports = router;