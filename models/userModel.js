const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: String,
    default: "0",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  wallet:{
    type:Number,
    default:0,
    required:true
  },
  history: {
    type:Array,
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default:Date.now,
        
    }
},
  ///////////CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
  cart: [{

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product"
    },
    quantity: {
      type: Number,
      
      required: true,

    },
    weight: {
      type: Number,
      required: true
    },
    flavour: {
      type: String,
      required: true
    },
    subTotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true

    }
  }],
  //.................ADDRESS...............................
  address:[{
    fullName: {
      type: String,
      required: true,
  },
  mobile: {
      type: Number,
      required: true,
  },
  landMark: {
      type: String,
      required: true,
  },
  pinCode: {
      type: Number,
      required: true,
  },
  address: {
      type: String,
      required: true,
  },
  city: {
      type: String,
      required: true,
  },
  state: {
      type: String,
      required: true,
  },
  addressType: {
      type: String,
      default:"Home"
  },
  main: {
      type: Boolean,
      default: false,
  },
  }],
});

//Export the model
module.exports = mongoose.model('User', userSchema);