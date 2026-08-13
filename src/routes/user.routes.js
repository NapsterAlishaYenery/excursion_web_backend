// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validateUser = require('../middlewares/user-validator.middleware');
const upload = require('../middlewares/upload.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');

// ========================================
// RUTAS PÚBLICAS (Sin autenticación)
// ========================================

/**
 * @route   POST /api/users/register
 * @desc    Registrar un nuevo administrador
 * @access  Público (por ahora)
 * @body    { firstName, lastName, email, password, address?, role? }
 * @file    avatar (opcional)
 */
router.post(
    '/register',
    rateLimiter,
    upload.single('avatar'),
    validateUser.signUp,
    userController.signUp
);

/**
 * @route   POST /api/users/login
 * @desc    Iniciar sesión
 * @access  Público
 * @body    { identifier, password }
 * @returns Cookie con JWT
 */
router.post(
    '/login',
    rateLimiter,
    validateUser.login,
    userController.login
);

/**
 * @route   POST /api/users/logout
 * @desc    Cerrar sesión
 * @access  Público
 * @returns Limpia la cookie
 */
router.post(
    '/logout',
    rateLimiter,
    userController.logout
);

// ========================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ========================================

// 🔒 Pendiente para cuando tengas el primer admin
// router.get('/me', authMiddleware, userController.getMe);
// router.put('/me', authMiddleware, userController.updateMe);
// router.get('/', authMiddleware, isAdminMiddleware, userController.getAll);

module.exports = router;