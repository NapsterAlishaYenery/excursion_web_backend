// src/middleware/user-validator.middleware.js
const Joi = require('joi');

/**
 * Esquema base de Usuario (Administradores del sistema)
 * Define las reglas estrictas para el registro.
 */
const joiUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
        'any.required': 'First name is required',
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name cannot exceed 50 characters'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
        'any.required': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name cannot exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Please provide a valid email'
    }),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional().allow('', null).messages({
        'string.pattern.base': 'Phone must contain only numbers (10-15 digits)'
    }),
    password: Joi.string().min(8).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 8 characters'
    }),
    role: Joi.string().valid('super_admin', 'admin', 'editor').optional().default('admin').messages({
        'any.only': 'Role must be super_admin, admin, or editor'
    }),
    // ✅ Dirección opcional
    address: Joi.object({
        street: Joi.string().allow('', null).optional(),
        city: Joi.string().allow('', null).optional(),
        state: Joi.string().allow('', null).optional(),
        country: Joi.string().allow('', null).optional(),
        postalCode: Joi.string().allow('', null).optional(),
        coordinates: Joi.object({
            lat: Joi.number().allow(null).optional(),
            lng: Joi.number().allow(null).optional()
        }).optional()
    }).optional().default({})
});

const validateUser = {

    /**
     * Validación para REGISTRO (SignUp)
     */
    signUp: (req, res, next) => {
        const { error } = joiUserSchema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                ok: false,
                data: null,
                type: 'ValidationError',
                messages: errors
            });
        }
        next();
    },

    /**
     * Validación para LOGIN
     */
    login: (req, res, next) => {
        const schema = Joi.object({
            identifier: Joi.string().required().messages({
                'any.required': 'Email is required.'
            }),
            password: Joi.string().required().messages({
                'any.required': 'The password is required.'
            })
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                ok: false,
                data: null,
                type: 'ValidationError',
                message: error.details[0].message
            });
        }
        next();
    },

    /**
     * Validación para ACTUALIZACIÓN (Update)
     */
    update: (req, res, next) => {
        let updateSchema = joiUserSchema.fork(
            Object.keys(joiUserSchema.describe().keys),
            (schema) => schema.optional()
        );

        // Campos prohibidos (no se pueden actualizar directamente)
        updateSchema = updateSchema.append({
            _id: Joi.any().forbidden(),
            createdAt: Joi.any().forbidden(),
            updatedAt: Joi.any().forbidden(),
            password: Joi.any().forbidden().messages({
                'any.unknown': 'Usa el flujo de recuperación de contraseña para cambiarla'
            }),
            email: Joi.any().forbidden().messages({
                'any.unknown': 'El correo no se puede cambiar manualmente'
            }),
            username: Joi.any().forbidden().messages({
                'any.unknown': 'El nombre de usuario es permanente'
            }),
            role: Joi.any().forbidden().messages({
                'any.unknown': 'Solo un administrador puede cambiar los roles'
            }),
            active: Joi.any().forbidden().messages({
                'any.unknown': 'Usa el endpoint de desactivación para cambiar el estado de la cuenta'
            })
        });

        const { error } = updateSchema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                ok: false,
                data: null,
                type: 'ForbiddenFieldError',
                messages: errors
            });
        }

        // Verificar que al menos un campo esté presente para actualizar
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                ok: false,
                data: null,
                type: 'EmptyRequest',
                message: "Por favor, proporciona al menos un campo para actualizar (nombre, apellido o dirección)"
            });
        }

        next();
    },
    /**
     * Validación para ACTUALIZACIÓN POR ADMIN (updateById)
     * Permite actualizar role (ya que es admin)
     */
    updateById: (req, res, next) => {
        let updateSchema = joiUserSchema.fork(
            Object.keys(joiUserSchema.describe().keys),
            (schema) => schema.optional()
        );

        // Campos prohibidos (no se pueden actualizar directamente)
        updateSchema = updateSchema.append({
            _id: Joi.any().forbidden(),
            createdAt: Joi.any().forbidden(),
            updatedAt: Joi.any().forbidden(),
            password: Joi.any().forbidden().messages({
                'any.unknown': 'Usa el flujo de recuperación de contraseña para cambiarla'
            }),
            email: Joi.any().forbidden().messages({
                'any.unknown': 'El correo no se puede cambiar manualmente'
            }),
            username: Joi.any().forbidden().messages({
                'any.unknown': 'El nombre de usuario es permanente'
            }),
        });

        const { error } = updateSchema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                ok: false,
                data: null,
                type: 'ValidationError',
                messages: errors
            });
        }

        // Verificar que al menos un campo esté presente para actualizar
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                ok: false,
                data: null,
                type: 'EmptyRequest',
                message: "Por favor, proporciona al menos un campo para actualizar"
            });
        }

        next();
    }
};

module.exports = validateUser;