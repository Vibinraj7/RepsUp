const express = require('express');
const admin_route = express();

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');
const { upload } = require('../multer/multer');
const adminAuth = require('../middlewares/adminAuth')

const { loadAdminLogin, verifyAdmin, logout, users, dash, blockUser, unblockUser, ordersList, orderDetails, updateStatus } = require('../controllers/adminController')
const { addProduct, createProduct, allProducts, editProduct, editedProduct, deleteProduct, deleteImage, unlistProduct, listProduct, undoDelete, deleteWeight, deleteFlavour, filter } = require('../controllers/productController')
const { allCategory, addCategory, editCategory, updateCategory, deleteCategory, unlistCategory, listCategory, addOffer, productOffer } = require('../controllers/categoryController');
const { allBrands, addBrand, deleteBrand, editBrand, updateBrand, unlistBrand, listBrand, deleteBimage } = require('../controllers/brandController');
const { viewAddCoupon, addCoupon, viewCoupon, editCoupon, editedCoupon, deleteCoupon }=require('../controllers/couponController');
const { addBanner, createBanner, banner, editBanner, edittedBanner, deleteBanner } = require('../controllers/bannerController');
const { pdfDownload } = require('../controllers/orderController');
//........................................................................................

admin_route.get('/', adminAuth.isLogedOut, loadAdminLogin);
admin_route.post('/login', verifyAdmin);
admin_route.get('/dash', adminAuth.isLogedIn, dash);
admin_route.get('/users', adminAuth.isLogedIn, users);
admin_route.get('/blocked', adminAuth.isLogedIn, blockUser);
admin_route.get('/unblocked', unblockUser);
admin_route.get('/logout', adminAuth.isLogedIn, logout);
//.......................................................................................
//........PRODUCT.........................................................................
admin_route.get('/product', adminAuth.isLogedIn, allProducts)
admin_route.get('/product/:page', allProducts);
admin_route.get('/addProduct', adminAuth.isLogedIn, addProduct);
admin_route.post('/createProduct', upload.array('images', 12), createProduct)
admin_route.get('/editProduct', adminAuth.isLogedIn, editProduct)
admin_route.post('/editedProduct',upload.array('images',12), editedProduct);
admin_route.post('/deleteImage',deleteImage)
admin_route.get('/deleteProduct', adminAuth.isLogedIn, deleteProduct);
admin_route.get('/undoDeleteProduct', adminAuth.isLogedIn,undoDelete)
admin_route.get('/unlistProduct',unlistProduct);
admin_route.get('/listProduct',listProduct);
admin_route.post('/deleteWeight',deleteWeight)
admin_route.post('/deleteFlavour',deleteFlavour)
//...........CATEGORY.........................................................................
//............................................................................................

admin_route.get('/category', adminAuth.isLogedIn, allCategory);
admin_route.post('/addCategory', addCategory)
admin_route.get('/editCategory', editCategory)
admin_route.post('/updateCategory', updateCategory);
admin_route.get('/deleteCategory', adminAuth.isLogedIn, deleteCategory);
admin_route.get('/unlistCategory', adminAuth.isLogedIn, unlistCategory)
admin_route.get('/listCategory', listCategory);
//.......................................................................................

//....BRAND........................................................................................

admin_route.get('/brands', adminAuth.isLogedIn,allBrands);
admin_route.post('/addBrand',upload.single('images'), addBrand);
admin_route.get('/deleteBrand', deleteBrand)
admin_route.get('/editBrand',adminAuth.isLogedIn, editBrand);
admin_route.post('/updateBrand',upload.single('images'), updateBrand)
admin_route.get('/unlistBrand', unlistBrand);
admin_route.get('/listBrand', listBrand);
//....................................................ORDERSSSS........................................................
admin_route.get("/ordersList",ordersList)
admin_route.get("/orderDetails",adminAuth.isLogedIn,orderDetails);
admin_route.get('/updateStatus',updateStatus)

//................................................ADD COUPON.............................................................
admin_route.get('/addCoupon',adminAuth.isLogedIn,viewAddCoupon);
admin_route.post('/addTheCoupon',adminAuth.isLogedIn,addCoupon)
admin_route.get('/coupon',adminAuth.isLogedIn,viewCoupon)
admin_route.get('/editCoupon',editCoupon);
admin_route.post('/editTheCoupon',editedCoupon);
admin_route.get('/deleteCoupon',deleteCoupon);

admin_route.get('/filter',filter);
//..................................................OFFER %..........................................................
admin_route.get('/addOffer',addOffer);
admin_route.get('/productOffer',productOffer)


//.................................................BANNER.........................................................
admin_route.get('/addBanner',addBanner);
admin_route.post('/createBanner',upload.single('image'),createBanner);
admin_route.get('/banners',adminAuth.isLogedIn,banner);
admin_route.get('/editBanner',adminAuth.isLogedIn,editBanner);
admin_route.post('/edittedBanner',upload.single('image'),edittedBanner)
admin_route.get('/deleteBanner',deleteBanner);

//............DOWNLOAD PDF................................................................................


module.exports = admin_route;