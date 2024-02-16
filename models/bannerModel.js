const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true
    },
    startDate:{
        type:String,
        require:true
    },
    endDate:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }


})

module.exports = mongoose.model('Banner',bannerSchema)