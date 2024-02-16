const Coupon = require('../models/couponModel');
const { coupons } = require('./userController');
const User = require('../models/userModel');
const Brand = require('../models/brandModel');

const viewAddCoupon = async(req,res)=>{
    try {
        const adminSession = req.session.Admin;
       
        res.render('addCoupon',{adminSession})
    } catch (error) {
        console.log("admin View Add Coupon Page error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}

//.........................................................................................................
const addCoupon = async(req,res)=>{
    try {
        const adminSession = req.session.Admin;
        const{name,description,offerPrice,minimumAmount,expiryDate} = req.body;
        
        console.log("itself"+name,description,offerPrice,minimumAmount,expiryDate);

        const exist = await Coupon.findOne({name:name});
        if(!exist){

        const coupon = new Coupon({
            name:name,
            description:description,
            offerPrice:offerPrice,
            minimumAmount:minimumAmount,
            createdOn: Date.now(),
            expiryDate:expiryDate,
           
        })
       const save =  await coupon.save();
       res.render('addCoupon',{message:"Coupon Added Successfully!",adminSession})
    }else{
        res.render('addCoupon',{messages:"Failed! Coupon Already Exist",adminSession})
       }
    } catch (error) {
        console.log("admin Add Coupon Page error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//......................................................................................................
const viewCoupon = async(req,res)=>{
    try {
        const adminSession = req.session.Admin;
        const coupons = await Coupon.find();
        res.render('coupons',{adminSession,coupons});

    } catch (error) {
        console.log("admin View Coupon Page error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//......................................................................................................
const editCoupon = async(req,res)=>{
    try {
        const adminSession = req.query.Admin;
        const couponId = req.query.id
        const coupon = await Coupon.findById(couponId);
        if(coupon){
            res.render('editCoupon',{adminSession,coupon});
        }else{
            console.log("admin View Coupon Page error",error);
            res.status(404).render('errorPage', { message: 'Cannot find Coupon at this time!', statuscode: 404});
        }
    } catch (error) {
        console.log("Edit Coupon Page error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//....................................................................................................................
const editedCoupon = async(req,res)=>{
    try {
        const{name,description,offerPrice,minimumAmount,expiryDate} = req.body;
        const couponId = req.query.id;
        const coupon = await Coupon.findByIdAndUpdate(couponId,{
            name:name,
            description:description,
            offerPrice:offerPrice,
            minimumAmount:minimumAmount,
            createdOn: Date.now(),
            expiryDate:expiryDate,
        })
       const save =  await coupon.save();
       if(save){
        res.redirect('/admin/coupon');
       }

    } catch (error) {
        console.log("edited Coupon View Page error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//.....................................................................................................................
const deleteCoupon = async(req,res)=>{
    try {
        const couponId = req.query.id;
        const deleted = await Coupon.findByIdAndDelete(couponId);
        if(deleted){
            res.json({status:true});

        }else{
            res.json({status:false});
        }
    } catch (error) {
        console.log("Delete Coupon Page error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//......................................................................................................
//.................VERIFY USER COUPON...................................................................
const verifyCoupon = async(req,res)=>{
    try {
        const name = req.body.couponName;
        const totalAmount = req.body.cartTotal
        const coupon = await Coupon.findOne({name:String(name)});
        const user = await User.findById(req.session.user);
        if(!coupon){
           return res.json({status:false});
        }
        if(parseInt(totalAmount) < parseInt(coupon.minimumAmount)){
            return res.json({status:false});
        }
        if(coupon.user.some(item=> String(item.userId) === String(user._id))){
           return  res.json({status:false});
        }
      
       return  res.json({status:true,coupon:coupon});

    } catch (error) {
        console.log("verify coupon Page error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}



module.exports={
    viewAddCoupon,
    addCoupon ,
    viewCoupon,
    editCoupon,
    editedCoupon,
    deleteCoupon,
    verifyCoupon 
}