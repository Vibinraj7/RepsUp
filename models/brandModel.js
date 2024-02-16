const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
     type:String,
     require:true,
    },
    images:{
        type:String,
        required:true
    },
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Brand',brandSchema);