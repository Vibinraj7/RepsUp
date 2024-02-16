const User=require('../models/userModel')
const Product=require('../models/productModel')
const Razorpay=require('razorpay')
const Coupon = require('../models/couponModel')
const Category = require('../models/categoryModel')


var instance = new Razorpay({ key_id:process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_SECRETKEY })


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_SECRETKEY,
});


const addMoneyToWallet =async (req, res)=> {
    try {
        const amount = req.body.amount;

        // Generate a unique order ID
        const orderId = generateUniqueOrderId();
        const generatedOrder = await generateOrderRazorpay(orderId, amount);
       
        
       console.log('this is genmatrator the walet order',generateOrderRazorpay);
        res.json({razorpayOrder: generatedOrder,status:true})
    
    } catch (error) {
        console.log("Category Filter page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//.....................................................................................................................
function generateUniqueOrderId() {
  
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    return `order_${timestamp}_${uniqueId}`;
}
//...................................................................................................................
const generateOrderRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("failed");
                console.log(err);
                reject(err);
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })
};
//.................................................................................................................
const walletPayment = async(req,res)=>{
    try {
        verifyOrderPayment(req.body)
        res.json({ status: true });
    } catch (error) {
        console.log("Category Filter page error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}

//.........................................................................................................
const verifyOrderPayment = (details) => {
    console.log("DETAILS : " + JSON.stringify(details));
    return new Promise((resolve, reject) => { 
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRETKEY)
        hmac.update(details.razorpay_order_id + '|' + details.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if (hmac == details.razorpay_signature) {
            console.log("Verify SUCCESS");
            resolve();
        } else {
            console.log("Verify FAILED");
            reject();
        }
    })
};

//....................................................................................................................
const updateMongoWallet = async(req,res)=>{
    try {
        const amount = parseFloat(req.body.amount); // Parse amount as a float

        //   console.log('this si the amount ;',amount);
            const userId = req.session.user;
        
    
            const user = await User.findByIdAndUpdate(userId, {
               $inc:{"wallet" : amount},
               $push:{
                "history":{
                    amount:amount,
                    status:"credit",
                    timestamp:Date.now()
                    
                }
               }
                
            }, { new: true });
    
            console.log('Updated user data:', user);
    
           if(user){
            res.json({status:true})
    
           }else{
            res.json({err:"user is not foundd"})
           }
    } catch (error) {
        console.log("Category Filter page error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//.................................................................................................................................
const wallet = async(req,res)=>{
    try {
        const userSession = req.session.user;
        const cartLength = req.session.cart;
        const category = await Category.find({status:true});
        const user = await User.findById(userSession)
        
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const startIndex = (page - 1)*pageSize;
        const endIndex = page * pageSize;
        const history = user.history.sort((a, b) => b.timestamp - a.timestamp).slice(startIndex,endIndex);

        const currentPage = page;
        const totalPages = Math.ceil(user.history.length / pageSize)
        

        res.render('transHistory',{userSession,cartLength,category,history,currentPage,totalPages})
        
    } catch (error) {
        console.log("Category Filter page error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}





module.exports={
    addMoneyToWallet,
    walletPayment,
    updateMongoWallet,
    wallet
}