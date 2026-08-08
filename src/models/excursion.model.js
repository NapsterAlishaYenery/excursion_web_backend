// models/excursion.model.js
const { Schema, model } = require('mongoose');
const slugify = require('slugify');
const stringArrayValidator = require('../utils/string-array.validator');
const priceValidator = require('../utils/price.validator');
const ImagesSchema = require('./schema/images.schema');

const ExcursionSchema = new Schema({
    // ========================================
    // INFORMACIÓN BÁSICA
    // ========================================
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        unique: true,
        index: true
    },
    slug: {
        type: String,
        required: [true, 'Slug is required for SEO'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [200, 'Short description must be less than 200 characters']
    },
    longDescription: {
        type: String,
        required: [true, 'Long description is required'],
        trim: true
    },

    // ========================================
    // PRECIOS (Simplificado)
    // ========================================
    pricing: {
        adultPrice: {
            type: Number,
            required: [true, 'Adult price is required'],
            min: [0, 'Price cannot be negative'],
            validate: priceValidator
        },
        childPrice: {
            type: Number,
            required: [true, 'Child price is required'],
            min: [0, 'Price cannot be negative'],
            validate: priceValidator
        },
        infantPrice: {
            type: Number,
            default: 0,
            min: [0, 'Price cannot be negative'],
            validate: priceValidator
        },
        //  Solo para mostrar "Paga 3 días antes" o similar
        paymentTerms: {
            type: String,
            trim: true,
            enum: ['full', 'deposit', 'pay_later'],
            default: 'full'
        },
        depositPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        ageRanges: {
            adult: { type: Number, min: 13, max: 99 },
            child: { type: Number, min: 3, max: 12 },
            infant: { type: Number, min: 0, max: 2 }
        },
    },

    // ========================================
    // DURACIÓN Y HORARIOS
    // ========================================
    duration: {
        value: {
            type: Number,
            required: [true, 'Duration value is required'],
            min: [1, 'Duration must be at least 1']
        },
        unit: {
            type: String,
            required: [true, 'Duration unit is required'],
            lowercase: true,
            enum: ['hour', 'hours', 'day', 'days', 'half_day']
        }
    },
    availableDays: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: [true, 'At least one day is required']
    },

    // ========================================
    // UBICACIÓN Y LOGÍSTICA
    // ========================================
    location: {
        name: {
            type: String,
            required: [true, 'Location name is required'],
            trim: true
        },
        coordinates: {
            lat: Number,
            lng: Number
        },
        //  Para "Punta Cana | 12h" en el card
        displayName: {
            type: String,
            trim: true
        }
    },
    startingPoint: {
        type: String,
        required: [true, 'Starting point is required'],
        trim: true
    },
    pickupInfo: {
        included: {
            type: Boolean,
            default: true
        },
        details: {
            type: String,
            trim: true
        },
        airbnbFriendly: {
            type: Boolean,
            default: true
        }
    },
    dropoffInfo: {
        type: String,
        trim: true
    },

    // ========================================
    // CONTENIDO Y EXPERIENCIA
    // ========================================
    //  Itinerario con pasos
    itinerary: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        //  Orden para mostrar con puntos y flechas
        order: {
            type: Number,
            default: 0
        },
        icon: {
            type: String,
            default: 'bi-check-circle'
        }
    }],
    //  Qué incluye y qué no
    inclusions: {
        included: {
            type: [String],
            required: [true, 'At least one inclusion is required'],
            validate: stringArrayValidator()
        },
        notIncluded: {
            type: [String],
            default: []
        }
    },
    //  Qué llevar
    whatToBring: {
        type: [String],
        required: [true, 'At least one item is required'],
        validate: stringArrayValidator()
    },
    //  Restricciones importantes
    importantDetails: {
        type: [String],
        default: []
    },

    // ========================================
    // BADGES Y ETIQUETAS (Para el Card View)
    // ========================================
    badges: [{
        text: {
            type: String,
            required: true,
            trim: true
        },
        variant: {
            type: String,
            enum: ['gold', 'primary', 'accent', 'outline', 'success'],
            default: 'primary'
        },
        type: {
            type: String,
            enum: ['feature', 'tag', 'promo', 'info'],
            default: 'tag'
        }
    }],

    // ========================================
    // IMÁGENES (Usando tu sub-modelo)
    // ========================================
    images: {
        type: ImagesSchema,
        required: [true, 'Main image is required']
    },

    // ========================================
    // METADATOS Y ORGANIZACIÓN
    // ========================================
    categories: {
        type: [String],
        required: [true, 'At least one category is required'],
        validate: stringArrayValidator()
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },

    // ========================================
    // SEO
    // ========================================
    seo: {
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        keywords: {
            type: [String],
            default: []
        }
    }

}, {
    versionKey: false,
    timestamps: true
});

// ========================================
// HOOKS
// ========================================

//  Generar slug automáticamente
ExcursionSchema.pre('validate', function () {
    if (this.isNew && this.name && !this.slug) {
        const date = new Date();
        const dateString = date.toISOString().split('T')[0];
        this.slug = `${slugify(this.name, { lower: true, strict: true })}-${dateString}`;
    }

    //  Validar que el depósito no exceda el precio
    if (this.pricing.paymentTerms === 'deposit' &&
        this.pricing.depositPercentage > 100) {
        this.invalidate(
            'pricing.depositPercentage',
            'Deposit percentage cannot exceed 100%'
        );
    }
});

//  Índices para búsquedas rápidas
ExcursionSchema.index({ categories: 1 });
ExcursionSchema.index({ 'location.coordinates': '2dsphere' });
ExcursionSchema.index({ isPublished: 1, isFeatured: -1 });
ExcursionSchema.index({ name: 'text', shortDescription: 'text', longDescription: 'text' });

module.exports = model('excursion', ExcursionSchema);