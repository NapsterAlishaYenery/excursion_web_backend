// models/user.model.js
const { Schema, model } = require('mongoose');
const { ImageItemSchema } = require("./schemas/images.schema");
const AddressSchema = require('./schemas/address.schema');  // ✅ Importar dirección

const UserSchema = new Schema({
    // ========================================
    // INFORMACIÓN PERSONAL
    // ========================================
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        // ✅ Validación: solo números, 10-15 dígitos
        match: [/^[0-9]{10,15}$/, 'Phone must contain only numbers (10-15 digits)']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },

    // ========================================
    // Direccion
    // ========================================
    address: {
        type: AddressSchema,
        required: false,  // ✅ Opcional
        default: () => ({})  // ✅ Si no se envía, usa valores por defecto
    },

    // ========================================
    // ROLES
    // ========================================
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'editor'],
        default: 'admin'
    },

    // ========================================
    // ESTADO
    // ========================================
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    avatar: ImageItemSchema,

    // ========================================
    // PREFERENCIAS
    // ========================================
    preferences: {
        language: {
            type: String,
            enum: ['es', 'en'],
            default: 'es'
        }
    }

}, {
    versionKey: false,
    timestamps: true
});

// ========================================
// VIRTUALES
// ========================================
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});


// Middleware para transformar la respuesta (Ocultar datos sensibles)
UserSchema.methods.toJSON = function () {
    const { password, ...user } = this.toObject();
    return user;
};

// ========================================
// EXPORTAR
// ========================================
module.exports = model('User', UserSchema);