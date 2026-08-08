// src/controllers/userController.js
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadFile, deleteFile } = require('../services/cloudinary.service');
const deleteLocalFiles = require('../utils/fileCleanup.util');

/**
 * REGISTRO DE USUARIO (Administradores del sistema)
 * POST /api/users/register
 */
exports.signUp = async (req, res) => {
    try {
        // ✅ CORREGIDO: firstName, lastName, phone
        const { firstName, lastName, email, password, address, role, phone } = req.body;

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({
            email: email.toLowerCase()
        });

        if (userExists) {
            return res.status(400).json({
                ok: false,
                data: null,
                type: 'UserExistsError',
                message: 'The email is already registered.'
            });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear nuevo usuario
        const newUser = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || '',  // ✅ phone agregado
            address,
            role: role || 'admin'
        });

        // Si hay avatar, subirlo a Cloudinary
        if (req.file) {
            const avatarResult = await uploadFile(req.file.path, 'users/avatars');
            newUser.avatar = {
                public_id: avatarResult.public_id,
                url: avatarResult.url,
                alt: `Avatar de ${firstName} ${lastName}`
            };
        }

        await newUser.save();

        res.status(201).json({
            ok: true,
            data: newUser,
            message: 'User successfully registered in System'
        });

    } catch (error) {
        console.error('❌ Error en SIGNUP:', error.message);
        res.status(500).json({
            ok: false,
            data: null,
            type: 'ServerError',
            message: 'Internal server error during registration'
        });

    } finally {
        if (req.file) await deleteLocalFiles(req.file);
    }
};

/**
 * LOGIN DE USUARIO (Administradores del sistema)
 * POST /api/users/login
 */
exports.login = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        // ✅ CORREGIDO: Solo busca por email
        const user = await User.findOne({
            email: identifier.toLowerCase()
        }).select('+password');

        // ✅ CORREGIDO: isActive en lugar de active
        if (!user || !user.isActive) {
            return res.status(401).json({
                ok: false,
                type: 'AuthError',
                data: null,
                message: 'Invalid credentials or disabled account'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                ok: false,
                type: 'AuthError',
                data: null,
                message: 'Invalid credentials'
            });
        }

        // Actualizar último login
        user.lastLogin = new Date();
        await user.save();

        // Generar token JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Enviar cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Remover contraseña antes de enviar respuesta
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.status(200).json({
            ok: true,
            data: userWithoutPassword,
            message: 'Welcome back to your system'
        });

    } catch (error) {
        console.error('❌ Error en LOGIN:', error.message);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            data: null,
            message: 'Internal server error during login'
        });
    }
};

/**
 * LOGOUT DE USUARIO (Administradores del sistema)
 * POST /api/users/logout
 */
exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({
        ok: true,
        message: "Session closed successfully.",
        data: null,
    });
};