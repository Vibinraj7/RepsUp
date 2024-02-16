const express = require('express');
const user_route = express.Router();
const userAuth = require('../middlewares/userAuth');



const { createUser,  loadRegister,  loadHome, loadLogin ,verifyLogin, resendOTP, emailVerify, logout, emailOTP, isBlocked, forgetPass, forgetPassEmailVerify, otpVerify, otpResend, confirmPassword, userCart, addtoCart, modifyCartQuantity, deleteCartItem, checkout, address, addAddress, updateAddress, editAddress, updateEditedaddress, deleteAddress, userProfile, changePassword, updatePass, editProfile, orderDetail, orderSpecific, returnProduct, coupons, categoryFilter, searchProduct,} = require('../controllers/userController');
const { productPage }=require('../controllers/productController')
const { orderPlaced, deleteCart, orderDetails, cancelOrder, downloadInvoice, verifyPayment }= require('../controllers/orderController');
const { verifyCoupon } = require('../controllers/couponController');
const{ addMoneyToWallet, walletPayment, updateMongoWallet, wallet }=require('../controllers/walletController')
// user_route.get('/emailOTP',emailOTP)

// user_route.get('/',loadHead)
user_route.get('/',userAuth.isLogedOut, loadHome)
user_route.get('/home',userAuth.isBlocked, userAuth.isLogedin, loadHome)
user_route.get('/login',userAuth.isLogedOut,loadLogin)
user_route.post('/login', verifyLogin);
user_route.get('/register', loadRegister);
user_route.post('/register',createUser);
user_route.post('/emailVerify',userAuth.isLogedOut,  emailVerify)
user_route.post('/resendOTP',resendOTP);
user_route.get('/logout',userAuth.isLogedin, logout);
// user_route.get('/isBlocked',isBlocked)
user_route.get('/forgetPass',forgetPass)
user_route.post('/forgetPassEmailVerify',forgetPassEmailVerify)
user_route.post('/otpVerify',otpVerify)
user_route.post('/otpResend',otpResend)
user_route.post('/confirmPassword',confirmPassword)
//......................................................................................................
user_route.get('/userCart',userAuth.isLogedin, userCart);
user_route.get('/addtoCart',addtoCart)
user_route.post('/modifyCartQuantity',modifyCartQuantity)
user_route.get('/deleteCartItem',deleteCartItem)
//......................................................................................................
user_route.get('/selectAddress',address)
user_route.get('/addAddress',addAddress)
user_route.post('/updateAddress',userAuth.isBlocked,userAuth.isLogedin,updateAddress)
user_route.get('/editAddress',editAddress);
user_route.post("/updateEditedAddress",updateEditedaddress)
user_route.get('/deleteAddress',deleteAddress)
//.....................................................................................................
user_route.get('/checkout',checkout);
user_route.post('/orderPlaced',orderPlaced);
user_route.get('/deleteCart',deleteCart)
user_route.get('/allOrderDetails',userAuth.isBlocked,userAuth.isLogedin, orderDetails);
//.......................................................................................................
user_route.get('/userProfile',userAuth.isBlocked,userAuth.isLogedin,userProfile)
user_route.get('/changePassword',userAuth.isLogedin,changePassword);
user_route.post('/updatePassword',userAuth.isLogedin,updatePass);
user_route.get('/editProfile',editProfile);

//...........CANCEL ORDER>>>>>>>>>>>>>..............................................................
user_route.get('/cancelOrder',cancelOrder)

//............ORDER dETAILS pAGE.>>>>>>.............................................................
user_route.get('/orderDetails',orderSpecific);

//.............DOWNlOAD invoice.....................................................................
user_route.get('/downloadInvoice',downloadInvoice);

//................ORDER PAYMENT VERIFT..............................................................
user_route.post('/verifyPayment',verifyPayment)

//................RETURN PRODUCT....................................................................
user_route.get('/return',returnProduct);

//..................COUPONS.......................................................................
user_route.get('/coupons',userAuth.isBlocked,userAuth.isLogedin,coupons)

//.................VERIFY COUPON...................................................................
user_route.post('/verifyCoupon',verifyCoupon);

//...............CATEGORY FILTERING..............................................................
user_route.get('/categoryFilter',userAuth.isBlocked,userAuth.isLogedin,categoryFilter);

//.....................SEARCH PRODUT..........................................................................
user_route.post("/searchProduct",searchProduct)

//.........ADD MONEY TO WALLET..................................................................................
user_route.post('/addMoneyToWallet',addMoneyToWallet)
user_route.post('/walletPayment',walletPayment);
user_route.post('/updateMongoWallet',updateMongoWallet)

user_route.get('/wallet',userAuth.isBlocked,userAuth.isLogedin,wallet)

user_route.get('/productD',userAuth.isLogedin, userAuth.isBlocked, productPage);


module.exports = user_route;