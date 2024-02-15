const User = require('../models/userModel');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const Brands = require('../models/brandModel')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const Orders = require('../models/orderModel')
const pdf = require('html-pdf');
const Coupons = require('../models/couponModel');
const Banner = require('../models/bannerModel');
// const { getInvoiceHtml } = require('./invoiceUtils');

///.....OTP form rendering for testing only.......................................
const emailOTP = async (req, res) => {
  try {
    res.render('emailOTP')
  } catch (error) {
    console.log("email OTP error", error.message)
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
// ...............................................................................

//......user Home & login & signup page rendering.................................

const loadRegister = async (req, res) => {
  try {

    const userId = req.session.user
    const user = await User.findById(userId);
    const userSession = req.session.user
    const cartLength = req.session.cart
    const category = await Category.find({ status: true })

    res.render('registration', { userSession, cartLength, category });
  } catch (error) {
    console.log("load register error", error.message);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
//..................HOME............................................................

const loadHome = async (req, res) => {
  try {
    const userSession = req.session.user
    const user = await User.findById(userSession);
    const product = await Product.find({ isDeleted: false, status: true })
    const brands = await Brands.find({ status: true });
    const cartLength = req.session.cart
    const category = await Category.find({ status: true })
    const banner = await Banner.find({isActive:true})


    res.render('home', { userSession, user, product: product, brands: brands, cartLength, category ,banner});

  } catch (error) {
    console.log("load Home error", error.message)
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}

//.......LOGINPAGE....................................................................

const loadLogin = async (req, res) => {
  try {
    // return
    const userId = req.session.user
    const user = await User.findById(userId);
    const userSession = req.session.user
    const cartLength = req.session.cart
    const category = await Category.find({ status: true })

    res.render('login', { userSession, cartLength, category });

  } catch (error) {
    console.log('Load login error', error.message);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}

//......................................................................................

//.............USER LOGOUT..............................................................

const logout = async (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) throw err;
      res.redirect('/')
    });
  } catch (error) {
    console.log("Error during logout", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
//...................................................................................
//......ISbLOCKED FOR BLOCKED USER...................................................
// const isBlocked = async (req, res) => {
//   try {

//     req.session.destroy(err => {
//       if (err) throw err;
//       const userSession = req.session;
//       const cartLength = 0
//       res.render('login', { message: "your account has been blocked by administrator", userSession,cartLength })
//     });
//   } catch (error) {
//     console.log("error on isBlocked controller", error)
//     res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

//   }
// }

//verify Login user..................................................................

const verifyLogin = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const banner = await Banner.find({isActive:true})
    const { email, password } = req.body;
    const findUser = await User.findOne({ email: email });

    if (findUser) {
      const findPass = await bcrypt.compare(password, findUser.password);
      if (findPass) {
        if (findUser.isBlocked == false) {
          req.session.user = findUser._id
          const name = findUser.username
          req.session.cart = findUser.cart.length;

          // const userSession = req.session.user
          // console.log(req.session.user+"this is verify login session")
          const product = await Product.find({ isDeleted: false, status: true })
          const brands = await Brands.find({ status: true });
          const userSession = req.session.user;
          const cartLength = req.session.cart

          res.render('home', { userSession, product: product, brands, cartLength, category ,banner})

          // console.log(userSession+"this is second verify loagin session")
          // res.render('header',{userSession})
        } else {
          const userSession = req.session.user
          const cartLength = req.session.cart
          res.render('login', { userSession, cartLength, message: "Your Account hasbeen BLOCKED by Administrator", category })
        }

      } else {
        // const userId = req.session.user
        // const user = await User.findById(userId);
        const userSession = req.session.user
        const cartLength = req.session.cart
        res.render('login', { userSession, cartLength, message: "invalid email or PASSWORD", category })
      }
    } else {
      // const userId = req.session.user
      // const user = await User.findById(userId);
      const userSession = req.session.user
      const cartLength = req.session.cart
      res.render('login', { userSession, cartLength, message: "Invalid EMAIL or password", category })
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render('errorPage', { message: "Internal server error", statuscode: 500 });
  }
}

//......OTP Generator>.....................................

function generatedOTP() {
  var digits = '1234567890'
  var OTP = ""
  for (let i = 0; i < 6; i++) {
    OTP = OTP + digits[Math.floor(Math.random() * 10)];
  }
  return OTP;

}
//>>..............................................................

//..... New user registration and OTP verification........
const createUser = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const email = req.body.email;

    console.log(email, ':User Email id ');

    const findUser = await User.findOne({ email: email })
    if (!findUser) {
      // Nodemailer>>>>>>>>
      const otp = generatedOTP();
      console.log(`Your OTP is >> ${otp}`);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.auth_email,
          pass: process.env.auth_pass
        }
      });
      const info = await transporter.sendMail({
        from: process.env.auth_email,
        to: email,
        subject: "verify Your Account",
        text: `Your OTP is :${otp}`,
        html: `<b> <h4> Your OTP is:${otp}</h4>  <br> <a href="/user/emailOTP/">Click here</a></b>`,
      });
      if (info) {
        req.session.userOTP = otp;
        req.session.userData = req.body;

        const userId = req.session.userData._id
        const user = await User.findById(userId);
        const userSession = req.session.user
        const cartLength = req.session.cart

        res.render("emailOTP", { cartLength, userSession, email: req.body.email, category })

      } else {
        res.json("email error");
      }
    } else {
      const userId = req.session.user
      const user = await User.findById(userId);
      const userSession = req.session.user
      const cartLength = req.session.cart
      res.render('registration', { userSession, cartLength, message: "User already exists", category });
    }

  } catch (error) {
    console.log("<create user> side  error", error.message);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });


  }
}
//.................................................................................................................

//...TO RESEND OTP into email using NodeMailer....................................................................
const resendOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      const otp = generatedOTP();
      console.log(`Your resend OTP is >> ${otp}`);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.auth_email,
          pass: process.env.auth_pass
        }
      });
      const info = await transporter.sendMail({
        from: process.env.auth_email,
        to: email,
        subject: 'Resended OTP Verification',
        text: `Your OTP is:${otp}`,
        html: `<b> <h4> Your OTP is:${otp}</h4>  <br> <a href="/user/emailOTP/">Click here</a></b>`,
      });
      if (info) {
        req.session.userOTP = otp;

        res.json({ success: true, message: 'emial', email: req.body.email });

      } else {
        res.json({ success: false, message: "email error" });
      }
    } else {
      res.json({ success: false, message: "Email already verified or User already exist" });

    }
  } catch (error) {
    console.log("error in <resend OTP section>", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
};
//......................................................................................................................
//.......Hash Password....................................................................................................
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log("error in securing password ", error.message);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
//...........................................................

//..Verify "OTP" and Save User Authorize User To Web Page..............................................................
const emailVerify = async (req, res) => {
  try {
    const banner = await Banner.find({isActive:true})
    const category = await Category.find({ status: true })
    const { first, second, third, fourth, fifth, sixth } = req.body;
    const enteredOTP = first + second + third + fourth + fifth + sixth;
    console.log(enteredOTP + "this is entered otp");
    console.log(req.session.userOTP + "this is generated otp");

    if (enteredOTP === req.session.userOTP) {
      const user = req.session.userData;
      const spassword = await securePassword(user.password)
      const saveUserData = new User({
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        password: spassword
      });
      const users = await saveUserData.save();
      // res.redirect('/')
      const product = await Product.find({ isDeleted: false, status: true })
      const brands = await Brands.find({ status: true });
      req.session.user = users._id;
      const userSession = req.session.user;
      req.session.cart = users.cart.length;
      const cartLength = req.session.cart
      res.render('home', { userSession, product, brands, cartLength, category ,banner});

    } else {
      //
      const userSession = req.body.user
      const cartLength = req.session.cart
      const email = req.query.email
      res.render('emailOTP', { userSession, cartLength, errMessage: "Invalid OTP", message: 'Invalid OTP', email: email, category })
    }
  } catch (error) {

    console.log("error in user Authentication", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
//...................................................................................................................................
//.........FORGET PASSWORD.............................................................................
const forgetPass = async (req, res) => {
  try {

    const userSession = req.session.user
    const cartLength = req.session.cart
    const category = await Category.find({ status: true })

    res.render('forgetPass', { cartLength, userSession, category });
  } catch (error) {
    console.log("forgetPassword side error", error)
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
//.FORGET PASS EMAIL VERIFY............................
const forgetPassEmailVerify = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      const userSession = req.session.user
      const cartLength = req.session.cart
      res.render('forgetPass', { cartLength, userSession, message: "Invalid email id create a new account!", category })
    } else {
      if (findUser.isBlocked === true) {
        const userSession = req.session.user
        const cartLength = req.session.cart
        res.render('forgetPass', { cartLength, userSession, message: "your account has been blocked", category })

      } else {
        const otp = generatedOTP();
        console.log(`Your OTP is >> ${otp}`);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.auth_email,
            pass: process.env.auth_pass
          }
        });
        const info = await transporter.sendMail({
          from: process.env.auth_email,
          to: email,
          subject: "verify Your Account",
          text: `Your OTP is :${otp}`,
          html: `<b> <h4> Your OTP is:${otp}</h4>  <br> <a href="/user/emailOTP/">Click here</a></b>`,
        });
        if (info) {
          req.session.userOTP = otp;
          // req.session.userData = req.body;

          // const userId = req.session.userData._id
          // const user = await User.findById(userId);
          const userSession = req.session.user
          const cartLength = req.session.cart

          res.render("otpverify", { cartLength, userSession, email: req.body.email, category })

        } else {
          res.json("email error");
        }
      }
    }

  } catch (error) {
    console.log("error in forgetPassEmailverify", error)
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
//.........FORGET PASSWORD EMAILED OTP VERIFY.......................
const otpVerify = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const { first, second, third, fourth, fifth, sixth } = req.body;
    const enteredOTP = first + second + third + fourth + fifth + sixth;
    console.log(enteredOTP + "this is entered otp");
    console.log(req.session.userOTP + "this is generated otp");
    if (enteredOTP === req.session.userOTP) {

      const userSession = req.session.user
      const cartLength = req.session.cart
      res.render('confirmPass', { cartLength, userSession, email: req.query.email, category })
    } else {
      const userSession = req.session.user
      const email = req.query.email
      const cartLength = req.session.cart
      res.render('otpVerify', { cartLength, userSession, errMessage: "Invalid otp", message: 'Invalid otp', email: email, category })
    }

  } catch (error) {
    console.log("error in otp verify", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
//............RESEND OTP TO USER WHEN FORGET PASSEORD..........................................
const otpResend = async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      const otp = generatedOTP();
      console.log(`Your resend OTP is >> ${otp}`);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.auth_email,
          pass: process.env.auth_pass
        }
      });
      const info = await transporter.sendMail({
        from: process.env.auth_email,
        to: email,
        subject: 'Resended OTP Verification',
        text: `Your OTP is:${otp}`,
        html: `<b> <h4> Your OTP is:${otp}</h4>  <br> <a href="/user/emailOTP/">Click here</a></b>`,
      });
      if (info) {
        req.session.userOTP = otp;

        res.json({ success: true, message: 'emial', email: req.body.email });

      } else {
        res.json({ success: false, message: "email error" });
      }
    } else {
      res.json({ success: false, message: " User not exist create new account" });

    }
  } catch (error) {
    console.log("otp Resend Side error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

  }
}
//........................................................................................

//.............CONFIRM NEW PASSWORD.......................................................

const confirmPassword = async (req, res) => {
  try {
    const banner = await Banner.find({isActive:true})
    const category = await Category.find({ status: true })
    const email = req.query.email;
    const password = req.body.firstPassword;
    console.log('this is from conform' + email, password);
    // return
    const user = await User.findOne({ email: email })
    console.log("this is user from confirmpass:" + user)
    if (user) {
      req.session.user = user._id
      const spassword = await securePassword(password)
      user.password = spassword;
      await user.save();
      const product = await Product.find({ isDeleted: false, status: true })
      const brands = await Brands.find({ status: true });
      const cartLength = req.session.cart

      res.render('home', { cartLength, userSession: req.session.user, product, brands, category,banner })
      return { success: true, message: 'Password updated successfully' };

    } else {
      return { success: false, message: 'User not found' };
    }
  } catch (error) {
    console.log("confirmPassword error", error)
    return { success: false, message: 'Internal server error' };
  }
}

//..............USER CART.............................................................................
const userCart = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const userSession = req.session.user;
    const user = await User.findById(userSession).populate('cart.productId');
    // const productId = req.query.id;
    // const product = await Product.findById(productId)
    // const product = await Product.find({ isDeleted: false, status: true })
    console.log("this is uder cart length:" + req.session.cart)
    // const brands = await Brands.find({ status: true });
    if (user) {
      console.log("this issssssssssssssss cart" + user);
      // const cartIds = user.cart.map(items=>(items.productId));

      let subTotal = 0;
      let quantity = 0;
      for (const item of user.cart) {
        subTotal = subTotal + item.subTotal;
        quantity = quantity + item.quantity;
      }
      // const productWithInfo = await Promise.all(user.cart.map(async(item)=>{
      //   const{productId,weight,flavour,quantity,subTotal} = item;
      //   const productDetail = await Product.findById(productId);
      //   return{
      //     ...productDetail.title,
      //     ...productDetail.price,
      //     ...productDetail.brand,
      //     ...productDetail.category,
      //     weight,
      //     flavour,
      //     quantity,
      //     subTotal
      //   }
      // }));
      cart = user.cart;
      console.log("this is cart from backend................." + cart)
      const cartLength = req.session.cart
      res.render('userCart', { cartLength, userSession, cart, quantity, subTotal, category });
    }



  } catch (error) {
    console.log("user Cart error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//...................................................................................................
//...............ADD TO CART.........................................................................
const addtoCart = async (req, res) => {
  try {
    // const weight = req.body.weight;
    const Flavour = req.query.flavour;
    const Weight = req.query.weight;
    const productId = req.query.id
    const weight = parseInt(Weight)
    const flavour = String(Flavour)

    // console.log("this is add to cart for cjecking weigth and flavout :" + productId, flavour, weight);
    const userSession = req.session.user;
    // console.log('user session' + userSession);
    const user = await User.findById(userSession);
    const product = await Product.findById(productId)

    let  productPrice
    if(product.offer > 0){
        productPrice = Math.round(product.price-(product.price * product.offer)/100)
     
    }else{
      productPrice =product.price
    }
    console.log("haooooooo"+productPrice);
    
    
    // console.log("this is caaart" + user.cart)
    if (user) {
      const findProductInCart = user.cart.find(item => String(item.productId) === String(productId));

      // console.log("caaaaaaaaaaaaaaaaaaaaaaaart" + findProductInCart)

      if (findProductInCart) {
        const sameProduct = user.cart.find(item => String(item.productId) === String(productId) && String(item.flavour) === flavour && parseInt(item.weight) === weight)
        // const sameProduct = await User.findOne(
        //   { _id: userSession },
        //   {
        //     cart: {
        //       $elemMatch: {
        //       productId: productId,
        //         flavour: flavour,
        //         weight: weight
        //       }
        //     }
        //   }
        // );


        // console.log("type of"+typeof(sameProduct.flavour)+","+typeof(flavour));
        // console.log("type of"+typeof(sameProduct.weight)+","+typeof(weight));
        // console.log("same caaaaaaaaaaaaaaaaaaaaaaaart" +sameProduct)

        // console.log("same ideeeeeeeeeeee caaaaaaaaaaaaaaaaaaaaaaaart" +sameProduct._id)
        // console.log("same weight mmmm caaaaaaaaaaaaaaaaaaaaaaaart" +sameProduct.weight,sameProduct.flavour)
        if (sameProduct) {
          // console.log('same producttttttttttttttttttttttttttttttttttttttttttttttttttttdddd')
          if (sameProduct.quantity < product.quantity) {
            const yeah = await User.updateOne({ _id: userSession, 'cart._id': sameProduct._id }, {

              $inc: {
                'cart.$.quantity': 1,
                'cart.$.subTotal': productPrice,
              }
            });
          } else {
            res.json({ status: false })
          }
          // const index = user.cart.findIndex(item => 
          //   item._id === sameProduct._id &&
          //   item.productId === productId &&
          //   item.flavour === flavour &&
          //   item.weight === weight
          // );

          // if (index !== -1) {
          //   // Update the specific element in the array
          //   user.cart[index].quantity += 1;
          //   user.cart[index].subTotal += product.price;

          //   // Save the updated user
          //   await user.save();
          // }

          // console.log("yeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeh")
        } else {

          user.cart.push({
            productId: productId,
            quantity: 1,
            weight: weight,
            flavour: flavour,
            total: productPrice,
            subTotal: productPrice

          })
          const savedUser = await user.save()
        }

      } else {
        console.log("inside findProduct ELSE")
        user.cart.push({
          productId: productId,
          quantity: 1,
          weight: weight,
          flavour: flavour,
          total: productPrice,
          subTotal: productPrice

        })
        const savedUser = await user.save()
        // console.log("this is saved user after adding cart" + savedUser);
      }
    }
    req.session.cart = user.cart.length
    res.json({ status: true })




    //   userProduct = {
    //     ProductId:productId,
    //     quantity: 1, // Example starting quantity
    //     weight: 1, // Example starting weight
    //     flavour: '', // Example flavour (you can set this dynamically)
    //     subTotal: 0, // Example subTotal (you can calculate this dynamically)
    //     total: 0

    //   }
    //         user.cart.push(userProduct);
    //         await user.save();
    // res.redirect('/home')
  } catch (error) {
    console.log("add to Cart error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}

//MODIFY CART QUANTITY.............................................................
const modifyCartQuantity = async (req, res) => {
  try {
    console.log("this is frommmmmmmmmmmmmmmmm modifyCartQuantity")
    const userId = req.session.user;
    const productId = req.body.productId.trim();

    const product = await Product.findById(productId)

    let  productPrice
    if(product.offer > 0){
        productPrice = Math.round(product.price-(product.price * product.offer)/100)
     
    }else{
      productPrice =product.price
    }

    // 
    // return
    const user = await User.findById(userId);
    if (user) {
      const cartId = req.body.cartId;
      const count = req.body.count
      let newQuantity
      const findProductInCart = user.cart.find(item => String(item._id) === String(cartId));
      console.log(findProductInCart + "yeeeeeeeeeeeeeeeeeeeeeeeeh");
      console.log(count);

      if (findProductInCart) {
        if (count == '1') {
          newQuantity = findProductInCart.quantity + 1;
          console.log(newQuantity)
        } else if (count == '-1') {
          newQuantity = findProductInCart.quantity - 1;
          console.log(newQuantity)
        } else {
          res.json({ status: false, error: "Invalid count" });
        }
        // return
        if (newQuantity > 0 && newQuantity <= product.quantity) {
          console.log("this isssssss new Quantity" + newQuantity);
          const updatedCartQuantity = await User.updateOne({ _id: userId, 'cart._id': cartId }, {
            $set: {
              'cart.$.quantity': newQuantity,
              'cart.$.subTotal': productPrice * newQuantity,
            }
          });
          await user.save();
          const totalAmount = productPrice * newQuantity;
          res.json({ status: true, quantity: newQuantity, subTotal: totalAmount })
        } else {
          res.json({ status: false, error: "Out of Stock" })
        }
      }
    }

  } catch (error) {
    console.log("modify Cart quantity error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
// .......................TO DELETE SINGLE ITEM FROM THE CART......................................
const deleteCartItem = async (req, res) => {
  try {
    const userId = req.session.user;
    const productId = req.query.productId;
    const cartId = req.query.cartId;
    const user = await User.findById(userId);

    if (user) {
      const cartItemIndex = user.cart.findIndex(item => String(item._id) === String(cartId));
      console.log('this is from delete cart item' + cartItemIndex)
      if (cartItemIndex !== -1) {
        user.cart.splice(cartItemIndex, 1);
        await user.save();
        req.session.cart = user.cart.length
        res.json({ status: true, message: 'Item deleted from cart successfully' });
      } else {
        res.json({ status: false, error: "Product Already Deleted From Cart" })
      }
    } else {
      res.json({ status: false, error: "User Not Found" })
    }
  } catch (error) {
    console.log("delete single cart item error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//..................CHECKOUT AND ADD ADDRESS PAGE RENDERING..........................
const address = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const userId = req.session.user;
    const user = await User.findById(userId)
    if (user) {
      const userAddress = user.address
      let subTotal = 0;
      let quantity = 0;
      for (const item of user.cart) {
        subTotal = subTotal + item.subTotal;
        quantity = quantity + item.quantity;
      }
      const cartLength = req.session.cart
      res.render('address', { cartLength, userSession: req.session.user, user, address: userAddress, subTotal, quantity, category })
    }

  } catch (error) {
    console.log("user address error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//..........ADD NEW USER ADDRESS....................................................................
const addAddress = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const wt = req.query.wt
    const userSession = req.session.user
    const cartLength = req.session.cart
    res.render('addAddress', { cartLength, userSession, wt, category });
  } catch (error) {
    console.log("user add address error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//............UPDATE ADDRESS....................................................................................
const updateAddress = async (req, res) => {
  try {

    const wt = req.query.wt;
    const { fullName, mobile, landMark, pinCode, address, townCity, state, addressType } = req.body;
    console.log('this is  from body of update address' + fullName, mobile, landMark, pinCode, address, townCity, state, addressType)

    const userId = req.session.user;
    const user = await User.findById(userId);
    if (user) {
      user.address.push({
        fullName: fullName,
        mobile: mobile,
        landMark: landMark,
        pinCode: pinCode,
        address: address,
        city: townCity,
        state: state,
        addressType: addressType
      })
      const savedAddrs = await user.save();
      if (wt) {
        res.redirect('/userProfile');
      } else {
        res.redirect('/selectAddress')
      }
    }
  } catch (error) {
    console.log("user update address error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//................EDIT USER ADDRESS..............................................................
const editAddress = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const addressId = req.query.id;
    const userId = req.session.user;
    const cartLength = req.session.cart
    const user = await User.findById(userId);
    const findAddress = user.address.find(item => String(item._id) === String(addressId))
    console.log("this is the address" + findAddress);
    if (findAddress) {

      res.render('editAddress', { cartLength, userSession: req.session.user, findAddress, category })
    }
  } catch (error) {
    console.log("user edit  address error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//................UPDATE EDITED ADDRESS.............................................................
const updateEditedaddress = async (req, res) => {
  try {
    const { id, fullName, mobile, landMark, pinCode, address, townCity, state, addressType } = req.body
    // console.log("this is id"+id,fullName,mobile,landMark,pinCode,address,townCity,state,addressType);
    const userId = req.session.user;
    const user = await User.findById(userId);
    const findAddress = user.address.find(item => String(item._id) === String(id));
    if (findAddress) {
      const updateAddress = await User.updateOne({ _id: userId, 'address._id': id }, {
        $set: {
          'address.$.fullName': fullName,
          'address.$.mobile': mobile,
          'address.$.landMark': landMark,
          'address.$.pinCode': pinCode,
          'address.$.address': address,
          'address.$.city': townCity,
          'address.$.state': state,
          'address.$.addressType': addressType
        }
      })
      await user.save();
      res.redirect('/selectAddress');
    } else {
      console.log("user update edited address error", error);
      res.status(404).render('errorPage', { message: 'Address Not Exist', statuscode: 404 });
    }

  } catch (error) {
    console.log("user update edited address error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//..........................DELETE ADDRESS..........................................................

const deleteAddress = async (req, res) => {
  try {
    const addressId = req.query.id;
    const userId = req.session.user;
    const user = await User.findById(userId);
    if (user) {
      const addressIndex = user.address.findIndex(item => String(item._id) === String(addressId));
      console.log("address index" + addressIndex);
      if (addressIndex !== -1) {
        user.address.splice(addressIndex, 1);
        await user.save();
        res.json({ status: true, message: "Address Deleted Successfully!" })
      } else {
        res.json({ status: false, error: "Address Already Deleted!" })
      }
    }
  } catch (error) {
    console.log("user delete address error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//...................CHECKOUT AND PAYMENT...............................................................
const checkout = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const Address = req.query.addressId
    console.log("this is id" + Address)
    const userSession = req.session.user;
    const cartLength = req.session.cart
    const user = await User.findById(userSession)
    const findAddress = user.address.find(item => String(item._id) === String(Address));
    const cartItems = user.cart
    let subTotal = 0;
    let quantity = 0;
    for (const item of user.cart) {
      subTotal = subTotal + item.subTotal;
      quantity = quantity + item.quantity;
    }

    if (address) {
      res.render('checkout', { cartLength, userSession, address: findAddress, user, cartItems, subTotal, category })
    }
  } catch (error) {
    console.log("user product checkout page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//.................USER PROFILE RENDERING...........................................

const userProfile = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const wt = 0;
    const userSession = req.session.user;
    const user = await User.findById(userSession);
    const cartLength = req.session.cart

    res.render('userProfile', { userSession, cartLength, user, wt, category })
  } catch (error) {
    console.log("user profile rendering page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}

//.......................CHANGE PASS WORD.....................................................................
const changePassword = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const userSession = req.session.user;
    const cartLength = req.session.cart;
    const user = await User.findById(userSession);

    res.render('changePassword', { userSession, cartLength, user, category })

  } catch (error) {
    console.log("change Password rendering page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//............  UPDATING NEW PASSWORD....................................................................................

const updatePass = async (req, res) => {
  try {
    const userId = req.session.user;
    const password = req.body.confirmPassword
    console.log(password + "thisssssssssssssssssssssssssssssss si si si");

    const user = await User.findById(userId);
    if (user) {
      const spassword = await securePassword(password);
      user.password = spassword;
      await user.save();
      res.redirect('/userProfile');
    } else {
      console.log("cannot find user from update Password", error);
      res.status(404).render('errorPage', { message: 'User Not Found', statuscode: 404 });
    }
  } catch (error) {
    console.log("Update Password page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}

//............................EDIT USER PROFILE ........................................................

const editProfile = async (req, res) => {
  try {
    const userId = req.query.id
    const user = await User.findById(userId);
    res.redirect('/userProfile');
  } catch (error) {
    console.log("Edit Profile page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//.............................................................................................................
const orderSpecific = async (req, res) => {
  try {
    let price = 0;
    const category = await Category.find({ status: true })
    const userSession = req.session.user
    const cartLength = req.session.cart
    const productId = req.query.id;
    const product = await Product.findById(productId);
    const orderId = req.query.orderId
    const order = await Orders.findById(orderId);


    const user = await User.findById(userSession);


    res.render('singleOrderDetails', { userSession, order, user, cartLength, category, price })
  } catch (error) {
    console.log("Edit Profile page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//........................RETURN  PRODUCT.............................................

const returnProduct = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const productId = req.query.productId
    const response = req.query.resp;
    // console.log(response,productId,orderId);

    // return

    const order = await Orders.findById(orderId);
    const product = order.product.find(item => String(item._id) === String(productId))

    if (product) {
    
      product.return = 'true'
      product.status = 'return requested'
      product.reason = response
    
      await order.save();
      // res.json({status:true})
    } else {
      res.status(404).render('errorPage', { message: 'Order Not Found!', statuscode: 404 });
    }

  } catch (error) {
    console.log("Return Product error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//..............................COUPONS AND OFFERS,..............................................
const coupons = async (req, res) => {
  try {
    const category = await Category.find({ status: true })
    const userSession = req.session.user;
    const cartLength = req.session.cart
    const coupons = await Coupons.find({
      user: { $nin: [userSession] },
      expiryDate: { $gte: new Date() }
    });
    res.render('offnCoupons', { userSession, coupons, cartLength, category });

  } catch (error) {
    console.log("Coupons page error from user controller", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//.................................CATEGORY FILTER...................................................................
const categoryFilter = async (req, res) => {
  try {
    const userSession = req.session.user;
    const cartLength = req.session.cart;
    const category = await Category.find({ status: true })
    const catId = req.query.catId;
    const product = await Product.find({ category: catId });
    const banner = await Banner.find({isActive:true})

    res.render('catFilter', { userSession, cartLength, category, product ,banner})
  } catch (error) {
    console.log("Category Filter page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}
//.................................PRODUCT SEARCH.............................................................................
const searchProduct = async (req, res) => {
  try {
    const userSession = req.session.user;
    const cartLength = req.session.cart;
    const category = await Category.find({ status: true })
    const search = req.body.searchBar
    const banner = await Banner.find({isActive:true})

    const product = await Product.find({
      title: { $regex: `${search}`, $options: 'i' }, isDeleted: false, status: true
    });
    res.render('catFilter', { cartLength, userSession, category, product,banner })


  } catch (error) {
    console.log("Category Filter page error", error);
    res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
  }
}


module.exports = {

  loadRegister,
  createUser,
  resendOTP,
  emailVerify,
  loadHome,
  loadLogin,
  verifyLogin,
  logout,
  emailOTP,
  // isBlocked,
  forgetPass,
  forgetPassEmailVerify,
  otpVerify,
  otpResend,
  confirmPassword,
  userCart,
  addtoCart,
  modifyCartQuantity,
  deleteCartItem,
  address,
  addAddress,
  updateAddress,
  editAddress,
  updateEditedaddress,
  deleteAddress,
  checkout,
  userProfile,
  changePassword,
  updatePass,
  editProfile,
  orderSpecific,
  returnProduct,
  coupons,
  categoryFilter,
  searchProduct


}