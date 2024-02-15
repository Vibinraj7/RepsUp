const Product = require('../models/productModel');
const User = require('../models/userModel');
const slugify = require("slugify");
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');
const Order = require('../models/orderModel')

//.................................USER  SIDE PRODUCT DETAIL PAGE...........................
const productPage = async (req, res) => {
    try {
        const category = await Category.find({ status: true })
        const userSession = req.session.user;
        const cartLength = req.session.cart
        // const user = await User.findById(userSession);
        const productId = req.query.id;
        const product = await Product.findById(productId);
        //{isDeleted:false,status:true},{new:true}^
        const id = product.brand

        const brand = await Brand.findById(id)
        // const productsInListedBrands = await Product.find()
        res.render('productDetail', { cartLength, userSession, product: product, brand, category });
    } catch (error) {
        console.log("error on user side Product detail page", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });


    }
}
//......................................................................................
//.........ADMIN SIDE PRODUCT LISTING..................................................
const allProducts = async (req, res) => {
    try {
        const limit = 8; // Number of products per page
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page number
        const products = await Product.find()
            .skip((page - 1) * limit)  // Skip the results from previous pages
            .limit(limit);  // Limit the number of results to "limit"

        const totalProduct = await Product.countDocuments();
        const totalPages = Math.ceil(totalProduct / limit);

        // console.log('this is prodect from all product' + products);


        const adminSession = req.session.Admin

        res.render('product', { adminSession, product: products, page, totalPages, limit });
    } catch (error) {
        console.log("admin all product view side page error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//.........................................................................................

//...........................ADMIN SIDE   ADD PRODUCT............................

const addProduct = async (req, res) => {
    try {
        const adminSession = req.session.Admin
        const brand = await Brand.find();
        const categories = await Category.find();
        res.render('addProduct', { adminSession, categories: categories, brand: brand });
    } catch (error) {
        console.log("add product page error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//............................................................................................
//................... ADMIN SIDE ADDED PRODUCT VERIFY AND SAVE...................................

const createProduct = async (req, res) => {
    try {
        //    return
        // const { title}  = req.body;
        // console.log('this is titile'+ title);
        // console.log('this is weight'+req.files);
        // return

        const { title } = req.body;
        const weights = req.body.weights;
        const flavours = req.body.flavours;
        const productData = req.body;
        console.log(weights)
        console.log(flavours)
        // return
        const productExist = await Product.findOne({ title });
        if (!productExist) {
            const caseSensitiveCondition = await Product.findOne({ title: { $regex: new RegExp('^' + title + '$', 'i') } });
            if (caseSensitiveCondition) {
                res.redirect('/admin/addProduct');
            } else {
                if (productData.title) {
                    productData.slug = slugify(productData.title)
                }

                const images = [];
                if (req.files && req.files.length > 0) {
                    for (let i = 0; i < req.files.length; i++) {
                        images.push(req.files[i].filename);
                        console.log("this is forech image" + images);
                    }
                }
                const weightArray = [];
                if (weights && weights.length > 0) {
                    for (let i = 0; i < weights.length; i++) {
                        weightArray.push(parseFloat(weights[i]));
                    }
                }
                console.log('eeeeeeeeeeeeeeeeeeeeeeeeee' + weightArray)
                const flavourArray = [];
                if (flavours && flavours.length > 0) {
                    for (i = 0; i < flavours.length; i++) {
                        flavourArray.push(flavours[i]);
                    }
                }

                // return

                const newProduct = new Product({
                    title: productData.title,
                    description: productData.description,
                    brand: productData.brand,
                    price: productData.price,
                    slug: productData.title,
                    flavour: flavourArray,
                    quantity: productData.quantity,
                    category: productData.category,
                    weight: weightArray,
                    images: images
                });
                const adminSession = req.session.Admin
                const savedProduct = await newProduct.save();
                res.redirect('/admin/product');
            }
        } else {
            console.log("product already exist");
            res.redirect('/admin/addProduct')
        }
    } catch (error) {
        console.log("error in create product section", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });


    }
}
//.............EDIT PRODUCT BY ADMIN......................................
const editProduct = async (req, res) => {
    try {
        const id = req.query.id;
        console.log('In edit product', id)
        const brand = await Brand.find()
        const categories = await Category.find();
        const product = await Product.findById(id);

        const currentProductBrand = await Brand.findById(product.brand);
        const currentProductCategory = await Category.findById(product.category)
        const adminSession = req.session.Admin

        if (product) {
            res.render('editProduct', { adminSession, product: product, currentProductBrand, brand, categories: categories, currentProductCategory });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.log("error on editProduct section ", error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//.......................................................................
const editedProduct = async (req, res) => {
    try {
        // return
        // console.log('haiiiiiiiiiii')
        const productData = req.body;
        // console.log('this is product data from edited product'+productData.title,productData.description,productData.brand,productData.price,productData.flavour,
        // productData.quantity,productData.Weight,productData.category)

        const id = req.query.id

        //  console.log("idddddddddddddddddddddd:"+  id)
        //  return
        const product = await Product.findById(id);
        // console.log("imaaaaaaaaaaaaaage:"+req.files)

        //   return

        const weights = req.body.weights;
        const flavours = req.body.flavours;
        console.log('this is weigth' + weights, flavours);
        console.log("flavour lwngth" + flavours.length)
        // return
        const weightArray = [];
        if (weights && weights.length > 0) {
            for (let i = 0; i < weights.length; i++) {
                weightArray.push(parseFloat(weights[i]));
            }
        }
        console.log('eeeeeeeee' + weightArray)
        // return
        // const flavourArray = [];
        // if(flavours && flavours.length>0){
        //     for(i =0 ;i<flavours.length;i++){
        //         flavourArray.push(flavours[i]);
        //     }
        // }


        let updateData = {
            title: productData.title,
            description: productData.description,
            brand: productData.brand,
            slug: slugify(productData.title),  // Assuming you're using slugify
            price: productData.price,
            flavour: flavours,
            quantity: productData.quantity,
            weight: weightArray,
            category: productData.category,
        };

        // Handle image upload
        if (req.files && req.files.length > 0) {
            const newImage = req.files.map(file => file.filename);
            if (product.images && product.images.length > 0) {
                updateData.images = product.images.concat(newImage)
            } else {
                updateData.images = newImage;
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        res.redirect('/admin/product');
    } catch (error) {
        console.log("error on edited Product page", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });


    }
}
//...for delete image...................................

const deleteImage = async (req, res) => {
    try {

        const imageIndex = req.body.imageIndex;
        const productId = req.body.productId
        Product.findById(productId).then(product => {
            if (product) {
                product.images.splice(imageIndex, 1);
                product.save();
            }
        });
        res.redirect('/admin/editProduct?id=' + productId);
    } catch (error) {
        console.log("delete image error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//..........TO DELETE CURRENT WEIGHT...............................................................
const deleteWeight = async (req, res) => {
    try {
        const productId = req.query.id;
        const index = req.query.index;
        console.log('thisi is from weight delete' + productId, index);
        //   return
        Product.findById(productId).then(product => {
            if (product) {
                product.weight.splice(index, 1);
                product.save();
            }
        });
        res.redirect('/admin/editProduct?id=' + productId);
    } catch (error) {
        console.log("delete product weigth error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//......FOR DELETE CURRENT FLAVOUR.......................................................................
const deleteFlavour = async (req, res) => {
    try {
        const productId = req.query.id;
        const index = req.query.index;
        console.log("flavour side" + productId, index);
        Product.findById(productId).then(product => {
            if (product) {
                product.flavour.splice(index, 1);
                product.save();
            }
        })
        res.redirect('/admin/editProduct?id=' + productId);
    } catch (error) {
        console.log("delete product flavour error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}



//...................................................................................................
const deleteProduct = async (req, res) => {
    try {
        const id = req.query.id
        const product = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!product) {
            return res.status(404).send({ message: "product not found" })
        }
        res.redirect('/admin/product')

    } catch (error) {
        console.log("deleteProduct error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });


    }
}
//.......UNDO DELETE........................................................................
const undoDelete = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
        if (!product) {
            return res.status(404).send({ message: "product not found" })
        }
        res.redirect('/admin/product')

    } catch (error) {
        console.log("undo delete Product error", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}



//.......UNLIST PRODUCT..................................
const unlistProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findByIdAndUpdate(id, { status: false }, { new: true });
        if (product) {
            res.redirect('/admin/product')
        }
    } catch (error) {
        console.log("error on unlisting product page", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//............LIST PRODUCT............................................

const listProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findByIdAndUpdate(id, { status: true }, { new: true });
        const brand = await Brand.findByIdAndUpdate(product.brand, { status: true })

        if (product) {
            res.redirect('/admin/product');
        }
    } catch (error) {
        console.log("error on listing prduct page", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}

//...............FILTER PRODUCT....................................................
const filter = async (req, res) => {
    try {
        const { start, end, value } = req.query
       
        const filter = {
            'product.status': value !== 'all' ? value : { $exists: true }, // Handle 'all' case
            createdOn: {
                $gte: new Date(start),
                $lte: new Date(end),
            },
        };


        // Query the database with the filter
        const filteredOrders = await Order.find(filter).sort({createdOn :-1});
        console.log(filteredOrders);
        
        res.json(filteredOrders);

    } catch (error) {

    }
}




module.exports = {
    productPage,
    addProduct,
    createProduct,
    allProducts,
    editProduct,
    editedProduct,
    deleteProduct,
    deleteImage,
    unlistProduct,
    listProduct,
    undoDelete,
    deleteWeight,
    deleteFlavour,
    filter
}