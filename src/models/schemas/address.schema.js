// models/schema/address.schema.js
const { Schema } = require('mongoose');

const AddressSchema = new Schema({
    street: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: 'Punta Cana'
    },
    state: {
        type: String,
        trim: true,
        default: 'La Altagracia'
    },
    country: {
        type: String,
        trim: true,
        default: 'Dominican Republic'
    },
    postalCode: {
        type: String,
        trim: true,
        default: '23000'
    },
    coordinates: {
        lat: Number,
        lng: Number
    }
}, { _id: false });

module.exports = AddressSchema;