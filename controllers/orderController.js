const User = require('../models/userModel');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const Brands = require('../models/brandModel')
const Orders = require('../models/orderModel');
const easyinvoice = require('easyinvoice')
const fs = require('fs')
const { Readable } = require("stream");
const { rejects } = require('assert');
const jsPDF = require('jspdf');
const Razorpay = require('razorpay');
const Coupon = require('../models/couponModel');


var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_SECRETKEY });


//.........................................................ORDER PLACING SAVING FROM USER CART............................
const orderPlaced = async (req, res) => {
    try {
        const { createdOn, date, addressId, payment,cartTotal,coupon } = req.body;
        console.log("form order controller" + createdOn, date, addressId, payment ,cartTotal,coupon);
        

        const userId = req.session.user;
        const user = await User.findById(userId).populate('cart.productId');
const coupons = await Coupon.findOne({name:coupon})



        let subTotal = 0;
        let quantity = 0;
        for (const item of user.cart) {
            subTotal = subTotal + item.subTotal;
            quantity = quantity + item.quantity;
        }

        const address = user.address.find(item => String(item._id) === String(addressId));
        // const productIds = user.cart.map(item=> item.productId )
        // console.log(productIds)
        // return  

        // const producDetails= await Product.find({ _id: { $in: productIds } });
        // console.log(producDetails+"product detailsssssssssssssssssss/........");

        const cart = user.cart;

        const orderedProducts = cart.map(products => ({
            productId: products.productId._id,
            title: products.productId.title,
            price: products.total,
            images: products.productId.images[0],
            quantity: products.quantity,
            // user.cart.find(item=> String(item.productId) === String(products._id)).quantity,
            weight: products.weight,
            // user.cart.find(item=> String(item.productId) === String(products._id)).weight,
            flavour: products.flavour,
            status: 'pending',
            // :user.cart.find(item=> String(item.productId) === String(products._id)).flavour,
        }))

        const order = new Orders({
            totalPrice: parseInt(cartTotal),
            createdOn: createdOn,
            date: date,
            product: orderedProducts,
            userId: userId,
            payment: payment,         
            address: address,     
        })
        if(coupons){
            order.coupon = parseInt(coupons.offerPrice)
        }
      
        const saveOrder = await order.save();
const addresses = order.address;
        for (const item of orderedProducts) {
            const findProduct = await Product.findById(item.productId);
            if (findProduct) {
                const newQuantity = findProduct.quantity - item.quantity;
                findProduct.quantity = Math.max(newQuantity, 0);
                await findProduct.save();
            }
        }
        if(saveOrder.payment == 'wallet'){
            if(parseInt(user.wallet) >= parseInt(saveOrder.totalPrice)){
                const user = await User.findByIdAndUpdate(userId, {
                    $inc:{"wallet" :-parseInt(cartTotal)},
                    $push:{
                     "history":{
                         amount:-parseInt(cartTotal),
                         status:"debit",
                         timestamp:Date.now()                      
                     }
                    }
                     
                 }, { new: true });
                // const products  = saveOrder.prodc

                 if(user){
                    await Promise.all(saveOrder.product.map(async(item)=>{
                        item.status = 'confirmed'
                    }))
                    //.......................................................EDITED SINGLE ORDER CANCEL....................................
                    // saveOrder.status = 'confirmed'
                    await saveOrder.save();
                 }
             
                if(coupons){
                    coupons.user.push({ userId:userId});
                    await coupons.save();
                }
                res.json({payment:true,method:'wallet'})

            }else{
                res.json({payment:false,method:'wallet'})
            }
        
        
        }else

        if (saveOrder.payment == 'cod') {

            await Promise.all(saveOrder.product.map(async(item)=>{
                item.status = 'confirmed'
            }))
            //...........................................................EDITED SINGLE ORDER CANCEL..............................................
            // saveOrder.status = 'confirmed'
            await saveOrder.save();
          
if(coupons){
            coupons.user.push({ userId:userId});
            await coupons.save();
        }
            res.json({ payment: true, method: 'cod', })

        } else if (saveOrder.payment == 'online') {

            const generateorOrder = await generateOrderByRazorpay(saveOrder._id, saveOrder.totalPrice);
            console.log("this is from RazorPay generat Order" + generateorOrder);

if(coupons){
            coupons.user.push({ userId:userId});
            await coupons.save();
        }
            res.json({ payment: false, method: 'online', order: saveOrder, razorpayOrder: generateorOrder ,user:user,address:addresses[0]})

        }


    } catch (error) {
        console.log("user order placing page error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
///////.............................GENERATE ORDER BY RAZOR PAY...................................................
const generateOrderByRazorpay = (orderId, total) => {
    return new Promise((resolve, rejects) => {
        const options = {
            amount: total * 100,
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("this is error", err);
                rejects(err)
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order)
            }

        });
    })
}
////////....................................................VERIFY ORDER BY  RAZOR PAY............................
const verifyPayment = async (req, res) => {
    try {
        const orders = req.body.order;
        
        verifyOrderPayment(req.body)

        //  await Orders.findByIdAndUpdate(orders._id, { status: 'confirmed' })
                                                  //....................................EDITED SINGLR ORDER CANCEL.............
const order = await Orders.findById(orders._id);
if(order){
    await Promise.all(order.product.map(async(item)=>{
        item.status = 'confirmed'
    }))
}
await order.save();

        res.json({ status: true });

    } catch (error) {
        console.log("user order placing page error", error);
        res.status(500).render('errorPage', { message: 'payment verifaction failed', statuscode: 500 });
    }
}
const verifyOrderPayment = (details) => {

    console.log("Order Verify DETAILS : " + JSON.stringify(details));

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

//........................../...............DELETING CART ITEMS AFTER PLACING THE ORDER.............................

const deleteCart = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId);
        user.cart = []
        const saveUsercart = await user.save();
        if (saveUsercart) {
            req.session.cart = user.cart.length
            res.json({ status: true });

        }
    } catch (error) {
        console.log("user deleting cart after  order placing page :error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//..............................................ORDER DETAILS PAGE RENDERING............................................................

const orderDetails = async (req, res) => {
    try {
        const userId = req.session.user;
        const cartLength = req.session.cart
        const user = await User.findById(userId)
        const orders = await Orders.find({ userId: userId }).sort({ createdOn: -1 });
        const category = await Category.find({status:true})
        // const itemsperpage = 10;
        // const currentpage = parseInt(req.query.page) || 1;
        // const startindex = (currentpage - 1) * itemsperpage;
        // const endindex = startindex + itemsperpage;
        // const totalpages = Math.ceil(orders.length /itemsperpage );
        // const currentproduct = orders.slice(startindex,endindex);


        res.render('orderDetails', { cartLength, userSession: userId, user, orders ,category})
    } catch (error) {
        console.log("user order Details page :error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//............................................................................................................

const cancelOrder = async (req, res) => {
    try {
        const orderId = String(req.query.orderId);
        const productId = String(req.query.productId);
        const userId = req.session.user

        if (orderId) {
            // const order = await Orders.findByIdAndUpdate(orderId, { status: 'canceled' }, { new: true });
            const order = await Orders.findById(orderId);
            const product = order.product.find(item => String(item.productId)=== String(productId) )
            if(order.payment == 'wallet'||'online' && product.status == 'confirmed'){


                const user = await User.findByIdAndUpdate(userId, {
                    $inc:{"wallet" :(parseInt(product.price)*parseInt(product.quantity))},
                    $push:{
                     "history":{
                         amount:parseInt(product.price * product.quantity),
                         status:"credit",
                         timestamp:Date.now()  
                     }
                    }
                 }, { new: true });
                 
                 product.status = 'canceled'
                 const newTotal = (order.totalPrice)-(parseInt(product.price)*parseInt(product.quantity));
                 order.totalPrice = newTotal;
                 await order.save();
            }

            product.status = 'canceled'
            await order.save();

            if (order) {
                for (const i of order.product) {
                    const newquantity = i.quantity;
                    const productIds = i.productId;

                    const product = await Product.findById(productIds);
                    if (product) {

                        product.quantity += newquantity
                        await product.save();
                    } else {
                        console.log("Cancel Order  page :error", error);
                        res.status(404).render('errorPage', { message: 'Product not Foundr', statuscode: 404 });
                    }
                }
                res.json({ status: true })

            } else {
                console.log("Cancel Order  page :error", error);
                res.status(404).render('errorPage', { message: 'Order not Foundr', statuscode: 404 });
            }
        }
    } catch (error) {
        console.log("user Cancel Order :error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//.......................DOWNLOAD INVOICE....................................................................................

const downloadInvoice = async (req, res) => {
    try {
        
        const id = req.query.orderId;
        console.log('this is rede id ', id);
        const userId = req.session.user;
        const orders = await Orders.findById({ _id: id });
        const product = orders.product.filter(item=>item.status == 'delivered');

      console.log(product)
      let totalpri =0;
  for(let i=0;i<product.length ;i++){
    totalpri = totalpri +(product[i].price * product[i].quantity)
  }

        const user = await User.findById({ _id: userId });
        const address = orders.address

        const order = {
            id: id,
            total: totalpri,
            date: orders.createdOn, // Use the formatted date
            paymentMethod: orders.payment,
            orderStatus: orders.status,
            name: address[0].fullName,
            number: address[0].mobile,
            house: address[0].address,
            pincode: address[0].pinCode,
            town: address[0].city,
            state: address[0].state,
            product: product,
        };
        //set up the product
        // let oid = new mongodb.ObjectId(id)
        // let Pname = result.product[0].title

        const products = order.product.map((product) => ({
            quantity: parseInt(product.quantity),
           
            description: product.title + "," + product.flavour,
            price: parseInt(product.price),
            totals: parseInt(order.totalpri),
            "tax-rate": 0,
        }));




        const isoDateString = order.date;
        const isoDate = new Date(isoDateString);

        const options = { year: "numeric", month: "long", day: "numeric" };
        const formattedDate = isoDate.toLocaleDateString("en-US", options);
        const data = {
            customize: {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
            },
            images: {
                // The invoice background
                logo: fs.readFileSync('C:/Users/user/Desktop/REPSUP/public/user/assets/imgs/theme/repsup logo.jpg', 'base64'),
            },
            // Your own data
            sender: {
                company: "REPSUP NUTRITIONS",
                address: "Edathuruthikaran Holdings Maradu",
                city: "Ernakulam",
                country: "India",
            },
            client: {
                company: "Customer Address",
                "name": order.name,
                "zip": order.pincode,
                "city": order.town,
                "address": order.name + "," + order.house,

            },
            information: {
                number: "orderID:" + order.id,
                date: formattedDate,
            },
            products: products,
            "bottom-notice": "Thanks For Shopping With REPSUP if any queries and complaints feel free to contact us,Keep in touch! ",
        };
        let pdfResult = await easyinvoice.createInvoice(data);
        const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");

        // Set HTTP headers for the PDF response
        res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
        res.setHeader("Content-Type", "application/pdf");

        // Create a readable stream from the PDF buffer and pipe it to the response
        const pdfStream = new Readable();
        pdfStream.push(pdfBuffer);
        pdfStream.push(null);

        pdfStream.pipe(res);

    } catch (error) {
        console.log("user Cancel Order :error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}

//...............................................................................................................]]



module.exports = {
    orderPlaced,
    deleteCart,
    orderDetails,
    cancelOrder,
    downloadInvoice,
    verifyPayment,
    
}