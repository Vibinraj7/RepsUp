const Admin = require('../models/userModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const Order = require('../models/orderModel');
const Product = require("../models/productModel")
const Category = require("../models/categoryModel");
const Brands = require("../models/brandModel");


//Load admin Login PAge..................................................
const loadAdminLogin = async (req, res) => {
    try {

        const adminSession = req.session.Admin

        res.render('adminLogin', { adminSession });
    } catch (error) {
        console.log('error in loadAdmin login', error.message)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//............................................................................

//Admin Login Verify...........................................................
const verifyAdmin = async (req, res) => {

    try {

        const { email, password } = req.body;
        const findAdmin = await Admin.findOne({ email: email });
        const findPass = await bcrypt.compare(password, findAdmin.password);

        if (findAdmin && findPass) {
            if (findAdmin.isAdmin != 0) {
                let p=0;
                req.session.Admin = findAdmin._id
                const adminSession = req.session.Admin
                const orders = await Order.find();
                const category = await Category.find();
                const brands = await Brands.find();
                const products = await Product.find();

                // ..........................................................................................
                const monthlySales = await Order.aggregate([
                    {
                        $unwind: '$product', // Unwind the product array
                    },
                    {
                        $match: {
                            'product.status': "delivered", // Filter by status inside the product array
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $month: '$createdOn',
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1,
                        },
                    },
                ]);
                const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
                    const monthData = monthlySales.find((item) => item._id === index + 1);
                    return monthData ? monthData.count : 0;
                });
                //............................................................................................
                const productsPerMonth = Array(12).fill(0);

                // Iterate through each product
                products.forEach(product => {
                  // Extract month from the createdAt timestamp
                  const creationMonth = product.createdAt.getMonth(); // JavaScript months are 0-indexed
            
                  // Increment the count for the corresponding month
                  productsPerMonth[creationMonth]++;
                });
                //............................................................................................

            
                res.render('adminDashboard', { adminSession, orders, category, brands ,products,p,productsPerMonth,monthlySalesArray});
            } else {
                const adminSession = req.session.Admin;
                res.render('adminLogin', { adminSession, message: 'Unauthorized Entry' })
            }
        } else {
            const adminSession = req.session.Admin;
            res.render('adminLogin', { adminSession, message: "Invalid Email Or Password" })
        }
    } catch (error) {
        console.log("error in verify adminn", error)

        res.status(500).render('errorPage', { message: "Internal server error", statuscode: 500 });
    }
}
//.........................................................................................
//..........DASH BOARD........................................................................
const dash = async (req, res) => {
    try {
        let p=0;
        const adminSession = req.session.Admin
        const orders = await Order.find();
        const category = await Category.find();
        const brands = await Brands.find();
        const products = await Product.find();

          // ..........................................................................................
          const monthlySales = await Order.aggregate([
            {
                $unwind: '$product', // Unwind the product array
            },
            {
                $match: {
                    'product.status': "delivered", // Filter by status inside the product array
                },
            },
            {
                $group: {
                    _id: {
                        $month: '$createdOn',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);
        const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = monthlySales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });
        //............................................................................................
        const productsPerMonth =[];

        // Iterate through each product
        products.forEach(product => {
          // Extract month from the createdAt timestamp
          const creationMonth = product.createdAt.getMonth(); // JavaScript months are 0-indexed
    
          // Increment the count for the corresponding month
          productsPerMonth[creationMonth]++;
        });
        //............................................................................................



        res.render('adminDashboard', { adminSession, orders, category, brands ,products,p,productsPerMonth,monthlySalesArray})
    } catch (error) {
        console.log("dash ERROR:", error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//............................................................


//.....USERS..............................................................................

const users = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4
        const skip = (page - 1) * limit;

        const user = await User.find({ isAdmin: { $ne: 1 } }).skip(skip).limit(limit);

        const totalUserCount = await User.countDocuments({ isAdmin: '0' });

        const totalPages = Math.ceil(totalUserCount / limit);

        const adminSession = req.session.Admin
        res.render('users', { adminSession, users: user, totalPages, page, limit });

    } catch (error) {
        console.log("Admin user section error", error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//.................................................................................
//.....................BLOCK USER/...................................................

const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const blocked = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true })
        if (blocked) {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log("block user section error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//...........................................................................................
//.............UNBLOCK USER.....................................................................

const unblockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const unblocked = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
        if (unblocked) {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log("unblock user error:", error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}


// Admin Logout..............................................................................
const logout = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) throw err;
            res.redirect('/admin?message=logout%20Successfully')
        })
    } catch (error) {
        console.log("admin logout error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}

///........................LIST ORDERS...........................................................................
const ordersList = async (req, res) => {
    try {
        const adminSession = req.session.Admin;
        const orders = await Order.find().sort({ createdOn: -1 });

        res.render('ordersList', { adminSession, orders })
    } catch (error) {
        console.log("admin order LIsting page  error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//...................SINGLE ORDER DETAILS.................................................................................
const orderDetails = async (req, res) => {
    try {
        let price = 0;
        const adminSession = req.session.Admin
        const productId = req.query.id;
        const product = await Product.findById(productId);
        const orderId = req.query.orderId
        const order = await Order.findById(orderId);
        const userId = req.query.userId;
        const user = await User.findById(userId);


        res.render('orderDetails', { adminSession, product, order, user, price })

    } catch (error) {
        console.log("admin single Order Details page error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//..........................ORDER STATUS UPDATION...........................................................

const updateStatus = async (req, res) => {
    try {
        const orderId = String(req.query.orderId);
        const status = String(req.query.status)
        const productId = String(req.query.productId)

        const order = await Order.findById(orderId);

        const userId = order.userId;
      

        const product = order.product.find(item => String(item.productId) == (productId));

        if(status === 'returned'){
            const user = await User.findByIdAndUpdate(userId, {
                $inc:{"wallet" :parseInt(product.price * product.quantity)},
                $push:{
                 "history":{
                     amount:parseInt(product.price * product.quantity),
                     status:"credit",
                     timestamp:Date.now()   
                 }
                }
             }, { new: true });
        }
        
        product.status = status;
        await order.save();
        if (order) {
            res.json({ status: true })
        } else {
            console.log("admin Update Status page error", error);
            res.status(404).render('errorPage', { message: 'Order Not Found', statuscode: 404 });
        }

    } catch (error) {
        console.log("admin single Order Details page error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}




module.exports = {
    loadAdminLogin,
    verifyAdmin,
    logout,
    users,
    dash,
    blockUser,
    unblockUser,
    ordersList,
    orderDetails,
    updateStatus
}
