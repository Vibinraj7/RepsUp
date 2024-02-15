const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    images: String,
    quantity: Number,
    weight: Number,
    flavour: String,
    status: { type: String, default: 'pending' },
    return:{type:Boolean,default:'false'},
    reason:{type:String,default:'nill'}
})


var orderSchema = new mongoose.Schema({
    totalPrice:{
        required:true,
        type:Number
    },
    createdOn:{
        required:true, 
        type:Date,
        default:Date.now
    },
    date:{
        required:true,
        type:String,
    },
    product: [productSchema],
    userId:{
        required:true,
        type:String

    },
    payment:{
        required:true,
        type:String,
    },
    // status:{
    //     required:true,
    //     type:String
    // },
    address:{
        type:Array,
        required:true
    },
    coupon:{
        type:Number,
        default:0
    }
    
});

//Export the model
module.exports = mongoose.model('Order', orderSchema);