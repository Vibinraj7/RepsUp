const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
//...........CATEGORY...................
const allCategory = async (req,res)=>{
    try {
        const allCategory=await Category.find();

        req.session.Category=allCategory;
        const adminSession = req.session.Admin
        res.render('category',({adminSession,category:allCategory}));
    } catch (error) {
        console.log(" this is all catogary error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//............../........................................
//..........ADD  CATEGORY..........................
const addCategory = async(req,res)=>{
    try {
        
        const {name,description,offer} = req.body
console.log(offer)


        const categoryExist = await Category.findOne({name});
        if(categoryExist){
            console.log("category exist")
            res.redirect('/admin/category?message=category+alreadyExist');
        }else{
            const casesensitiveCategoryExist = await Category.findOne({name:{$regex:new RegExp('^'+name+'$','i')}});
            if(casesensitiveCategoryExist){
                console.log("category exist")
                res.redirect('/admin/category')
            }
            const newCategory = new Category({
                name,
                description,
               
            })
             const savedCategory = await newCategory.save();
            res.redirect('/admin/category?message=Category+added+successfully');
        }

    } catch (error) {
        console.log("add category error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//...........................................................
//...EDIT CATEGORY PAGE RENDERING......................................
const editCategory = async(req,res)=>{
    try {
        const id= req.query.id;
        const category = await Category.findById(id);
        const adminSession = req.session.Admin
        
       if(category){
        res.render('editcategory',{adminSession,category:category})
       }else{
        res.redirect('/admin/category')
       }
    } catch (error) {
        console.log("error in edit category section",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//.............................................................
//......EDITING AND UPDATING CATEGORY///////...........................
const updateCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const updated = await Category.findByIdAndUpdate(id,{
            name:req.body.name,
            description:req.body.description
        },{new:true});

        if(updated){
            res.redirect('/admin/category?message=Category+updated+successfully');
        }
    } catch (error) {
        console.log("update Category side error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//..................................................................

//...........delete CATEGORY/.......................................

const deleteCategory = async (req,res)=>{
    try {
        const id = req.query.id;
        const category = await Category.findByIdAndDelete(id);
        if(category){
            
            res.redirect('/admin/category?message=category+delete+successfull')
        }else{
            res.status(404).json({message:"category not found"})
        }
    } catch (error) {        
        console.log("delete category side error",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
///.................UNLIST CATEGORY..............................

const unlistCategory = async(req,res)=>{
    try {
        const id = req.query.id
      const unlistedCategory =  await Category.findByIdAndUpdate(id,{
        status:false
       },{new:true});
if(unlistedCategory){
    res.redirect('/admin/category?message=category+unlisted+successfully')
}
    } catch (error) {
        console.log("error in category unlisting section",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//...............................................................................
//.........LIST CATEGORY............................................................

const listCategory = async(req,res)=>{
    try {
        const id = req.query.id
          const listCategory = await Category.findByIdAndUpdate(id,{status:true},{new:true})
if(listCategory){
    res.redirect('/admin/category?message=category+listed+successfully')
}
    } catch (error) {
        console.log("error in list Category section",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//..................................................................................
const addOffer = async(req,res)=>{
    try {
        const{offer,catId}=req.query
        const products = await Product.find({category:catId})

console.log(products);

 const y =await Promise.all(products.map(async(product)=>{
    product.offer=offer;
    await product.save();
}))
;

res.json({status:true});

    } catch (error) {
        console.log("error addOffer  in Category section",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//.............................PRODUCT OFFER................................................................................
const productOffer = async(req,res)=>{
    try {
        const{id,offer}=req.query;
        console.log(id,offer);
       
        const product = await Product.findByIdAndUpdate(id,{offer:String(offer)})
        if(product){
            res.json({status:true})
        }else{
            console.log("error productOffer  in Category section",error);
        res.status(404).render('errorPage', { message: 'Unable to find Product', statuscode: 404 });

        }
        
    } catch (error) {
        console.log("error productOffer  in Category section",error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    } 
}

module.exports ={
    allCategory,
    addCategory,
    editCategory,
    updateCategory,
    deleteCategory,
    unlistCategory,
    listCategory,
    addOffer,
    productOffer
}