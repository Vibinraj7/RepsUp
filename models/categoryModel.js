const mongoose = require('mongoose'); 

var categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Category', categorySchema);