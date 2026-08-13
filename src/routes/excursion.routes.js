const express = require('express');
const router = express.Router();
const excursionController = require('../controllers/excursion.controller');
const validateExcursion = require('../middlewares/excursion-validator.middleware');
const upload = require('../middlewares/upload.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const isAdminMiddleware = require('../middlewares/isAdmin.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');
const validateId = require('../middlewares/validate-id.middleware');



// ========================================
// RUTAS PÚBLICAS (Sin autenticación)
// ========================================

/**
 * @route   GET /api/excursions
 * @desc    Listar todas las excursiones (público)
 * @access  Público
 * @query   search, category, day, featured, page, limit
 */
router.get(
    '/',
    excursionController.getAllExcursions
);

/**
 * @route   GET /api/excursions/public/:slug
 * @desc    Obtener una excursión por slug (público)
 * @access  Público
 */
router.get(
    '/public/:slug',
    excursionController.getExcursionBySlug
);


// ========================================
// RUTAS ADMIN (Requieren autenticación)
// ========================================

/**
 * @route   GET /api/excursions/:id
 * @desc    Obtener una excursión por ID
 * @access  Admin
 */
router.get(
    '/admin/:id',
    authMiddleware,
    isAdminMiddleware,
    validateId.id,
    excursionController.getExcursionById
);

/**
 * @route   POST /api/excursions
 * @desc    Crear una nueva excursión
 * @access  Admin (super_admin, admin)
 * @body    form-data con todos los campos de la excursión
 * @files   main image + gallery images (opcional)
 */
router.post(
    '/',
    authMiddleware,
    isAdminMiddleware,
    rateLimiter,
    upload.array('images', 10),
    validateExcursion.create,
    excursionController.createExcursion
);

/**
 * @route   POST /api/excursions/:id/gallery
 * @desc    Agregar imágenes a la galería de una excursión
 * @access  Admin
 * @files   Campo 'images' con uno o varios archivos (hasta 10)
 */
router.post(
    '/:id/gallery',
    authMiddleware,
    isAdminMiddleware,
    rateLimiter,
    validateId.id,
    upload.array('images', 10),
    excursionController.addGalleryImages
);

/**
 * @route   PATCH /api/excursions/:id/main
 * @desc    Intercambiar imagen principal con una de la galería
 * @access  Admin
 * @body    { index: number }
 */
router.patch(
    '/:id/main',
    authMiddleware,
    isAdminMiddleware,
    rateLimiter,
    validateId.id,
    excursionController.swapMainImage
);

/**
 * @route   PATCH /api/excursions/:id
 * @desc    Actualizar una excursión (sin imágenes)
 * @access  Admin
 */
router.patch(
    '/:id',
    authMiddleware,
    isAdminMiddleware,
    validateId.id,
    rateLimiter,
    validateExcursion.update,
    excursionController.updateExcursion
);

/**
 * @route   DELETE /api/excursions/:id/gallery/:index
 * @desc    Eliminar una imagen de la galería
 * @access  Admin
 */
router.delete(
    '/:id/gallery/:index',
    authMiddleware,
    isAdminMiddleware,
    rateLimiter,
    validateId.id,
    excursionController.deleteGalleryImage
);

/**
 * @route   DELETE /api/excursions/admin/:id
 * @desc    Eliminar una excursión completa (con todas sus imágenes)
 * @access  Admin
 */
router.delete(
    '/admin/:id',
    authMiddleware,
    isAdminMiddleware,
    rateLimiter,
    validateId.id,
    excursionController.deleteExcursion
);


module.exports = router;