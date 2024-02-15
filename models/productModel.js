const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offer: {
        type: String,
        required: true,
        default: '0'
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        required: true
    },
    sold: {
        type: Number,
        default: 0,
        select: false
    },
    weight: [{
        type: Number,
        required: true,
    }],

    images: {
        type: Array,
        required: true
    },
    flavour: [{

        type: String,
        required: true,
    }],
    rating: [{
        star: Number,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);