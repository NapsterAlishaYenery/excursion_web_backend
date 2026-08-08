// src/models/schemas/images.schema.js
const { Schema } = require('mongoose');

const ImageItemSchema = new Schema({
    public_id: {
        type: String,
        required: [true, 'Full Id is required'],
        trim: true
    },
    url: {
        type: String,
        required: [true, 'URL is required'],
        trim: true,
    },
    alt: {
        type: String,
        required: [true, 'Alt (alt text) is required'],
        trim: true,
        default: 'Project capture'
    }
}, { _id: false });

const ImagesSchema = new Schema(
    {
        main: {
            type: ImageItemSchema,
            required: true
        },
        gallery: {
            type: [ImageItemSchema],
            default: []
        }
    },
    { _id: false }
);

// ✅ Exportar ambos
module.exports = {
    ImageItemSchema,
    ImagesSchema
};