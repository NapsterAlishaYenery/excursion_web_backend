// models/excursion.model.js
const { Schema, model } = require('mongoose');
const slugify = require('slugify');
const stringArrayValidator = require('../utils/string-array.validator');
const priceValidator = require('../utils/price.validator');
const { ImagesSchema } = require('./schemas/images.schema');

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
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'week'],
        required: [true, 'At least one day is required']
    },

    // ========================================
    // TURNOS (Shifts)
    // ========================================
    shifts: {
        // ¿Ofrece más de un turno al día? (doble/triple turno)
        // Regla: solo aplica a excursiones < 6 horas
        hasMultipleShifts: {
            type: Boolean,
            default: false
        },
        // Qué turnos específicos ofrece esta excursión
        // morning: matutino | afternoon: vespertino | night: nocturno
        availableShifts: {
            type: [String],
            enum: {
                values: ['morning', 'afternoon', 'night'],
                message: 'Shift must be one of: morning, afternoon, night'
            },
            default: ['morning'],
            validate: {
                validator: function (arr) {
                    if (!Array.isArray(arr) || arr.length === 0) return false;

                    // Si NO tiene múltiples turnos → exactamente 1
                    if (!this.shifts?.hasMultipleShifts) {
                        return arr.length === 1;
                    }
                    // Si SÍ tiene múltiples turnos → al menos 2 (doble/triple)
                    return arr.length >= 2 && arr.length <= 3;
                },
                message:
                    'Single-shift excursions must have exactly 1 shift; multi-shift excursions must have between 2 and 3 shifts'
            }
        }
    },

    // ========================================
    // UBICACIÓN Y LOGÍSTICA
    // ========================================
    location: {
        locationName: {
            type: String,
            required: [true, 'Location name is required'],
            trim: true
        },
        coordinates: {
            lat: Number,
            lng: Number
        },
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
    itinerary: [{
        titleItinerary: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        order: {
            type: Number,
            default: 0
        },
        icon: {
            type: String,
            default: 'bi-check-circle'
        }
    }],
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
    whatToBring: {
        type: [String],
        required: [true, 'At least one item is required'],
        validate: stringArrayValidator()
    },
    importantDetails: {
        type: [String],
        default: []
    },

    // ========================================
    // BADGES Y ETIQUETAS
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
    // IMÁGENES
    // ========================================
    images: {
        type: ImagesSchema,
        required: [true, 'Main image is required']
    },
    cloudinaryFolder: {
        type: String,
        required: [true, 'Cloudinary folder is required'],
        unique: true,
        trim: true
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
        required: [true, 'Order is required'],
        unique: true
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

ExcursionSchema.pre('validate', function () {
    // ✅ Generar slug automáticamente
    if (this.isNew && this.name && !this.slug) {
        const date = new Date();
        const dateString = date.toISOString().split('T')[0];
        this.slug = `${slugify(this.name, { lower: true, strict: true })}-${dateString}`;
    }

    // ✅ Validar que el depósito no exceda el precio
    if (this.pricing.paymentTerms === 'deposit' &&
        this.pricing.depositPercentage > 100) {
        this.invalidate(
            'pricing.depositPercentage',
            'Deposit percentage cannot exceed 100%'
        );
    }

    // ✅ Regla de negocio: multi-turno SOLO si duración < 6 horas (o half_day)
    if (this.shifts?.hasMultipleShifts) {
        const unit = this.duration?.unit;
        const value = this.duration?.value;

        const isHourUnit = unit === 'hour' || unit === 'hours';
        const isHalfDay = unit === 'half_day';

        // Multi-turno permitido solo si:
        //  - unit es hour/hours Y value < 6
        //  - unit es half_day (por definición ≤ 6h)
        const isShortDuration = (isHourUnit && value < 6) || isHalfDay;

        if (!isShortDuration) {
            this.invalidate(
                'shifts.hasMultipleShifts',
                'Multi-shift is only allowed for excursions shorter than 6 hours (hour < 6 or half_day)'
            );
        }
    }

    // ✅ Coherencia: sin multi-turno → exactamente 1 turno
    if (
        this.shifts &&
        !this.shifts.hasMultipleShifts &&
        Array.isArray(this.shifts.availableShifts) &&
        this.shifts.availableShifts.length > 1
    ) {
        this.invalidate(
            'shifts.availableShifts',
            'Cannot have more than 1 shift when hasMultipleShifts is false'
        );
    }

    // ✅ Coherencia: con multi-turno → mínimo 2 turnos
    if (
        this.shifts &&
        this.shifts.hasMultipleShifts &&
        Array.isArray(this.shifts.availableShifts) &&
        this.shifts.availableShifts.length < 2
    ) {
        this.invalidate(
            'shifts.availableShifts',
            'Multi-shift excursions must have at least 2 available shifts'
        );
    }
});

// ✅ Índices para búsquedas rápidas
ExcursionSchema.index({ categories: 1 });
ExcursionSchema.index({ 'location.coordinates': '2dsphere' });
ExcursionSchema.index({ isPublished: 1, isFeatured: -1 });
ExcursionSchema.index({ 'shifts.hasMultipleShifts': 1 });
ExcursionSchema.index({ 'shifts.availableShifts': 1 });
ExcursionSchema.index({ name: 'text', shortDescription: 'text', longDescription: 'text' });

module.exports = model('excursion', ExcursionSchema);