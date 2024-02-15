const Brand = require('../models/brandModel');
const Product = require('../models/productModel')
const Admin = require('../models/userModel')
//........................BRAND.........................................
const allBrands = async (req, res) => {
    try {
        const allBrands = await Brand.find();
        const adminSession = req.session.Admin;
        res.render('brand', { adminSession, brand: allBrands });
    } catch (error) {
        console.log("allbrads errors", error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//......................................................................
//...ADD BRAND.........................................................
const addBrand = async (req, res) => {
    try {
        // console.log(req.body)
        // console.log("request from braaaaaaaaaand" + req.body.brandname+".."+req.body.description + "...."+ req.file.filename)
        // return
        const  name= req.body.brandname
        const description = req.body.description
        const images = req.file.filename;
        const brandExist = await Brand.findOne({ name });
        if (!brandExist) {
            const casesensitiveBrandExist = await Brand.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
            
            if (!casesensitiveBrandExist) {

                const newBrand = new Brand({
                    name:name,
                    description:description,
                    images:images
                })
                const savedBrand = await newBrand.save();
                res.redirect('/admin/brands?message=brand+added+successfully');
            } else {
                res.redirect('/admin/brands?message=brand+already+exist');
            }
        } else {
            res.redirect('/admin/brands?message=brand+already+exist')
        }
    } catch (error) {
        console.log('error in brand add session', error);
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//...........................DELETE BRAND........................................................
const deleteBrand = async (req, res) => {
    try {
        const id = req.query.id;
        const findBrand = await Brand.findByIdAndDelete(id);
        if (findBrand) {
            res.redirect('/admin/brands?message=brand+removed+successfully')
        } else {
            res.status(404).json({ message: 'Brand not found' })
        }
    } catch (error) {
        console.log("delete Brand error",error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//..............................EDIT BRAND PAGE................................................................
const editBrand = async (req, res) => {
    try {
        const id = req.query.id;
        const findBrand = await Brand.findById(id);
        // const brand = findBrand
        // console.log(brand.images);
        // return
        const adminSession = req.session.Admin;
        if (findBrand) {
            res.render('editBrand', { adminSession, brand:findBrand })
        } else {
            res.status(404).json({ message: "Brand not found" })
        }
    } catch (error) {
        console.log("edit Brand error",error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}
//.....................UPDATE BRAND...............................................................................
const updateBrand = async (req, res) => {
    try {
        const name = req.body.name;
        const description = req.body.description;
        const id = req.query.id;
     
        let updatedData = {
            name:name,
            description:description,
        }
        if(req.file){
            updatedData.images = req.file.filename
        }
        const findBrand = await Brand.findByIdAndUpdate(id,updatedData,{new:true})
     
        if (findBrand) {
            res.redirect('/admin/brands?message=Brand+updated+seccessfuly')
        } else {
            res.status(404).json({ message: "Brand not found" })
        }
    } catch (error) {
        console.log("error on update Brand",error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
}



//.................................UNLIST BRAND.............................................................................
 const unlistBrand = async(req,res)=>{
    try {
        const id= req.query.id;
        const findBrand = await Brand.findByIdAndUpdate(id,{status:false},{new:true});
      
        const product = await Product.find()
        for(let i=0;i<product.length;i++){
            if(product[i].brand == id){
                const products = await Product.findByIdAndUpdate(product[i]._id,{status:false},{new:true});
            }
        }
        if(findBrand){
            res.redirect('/admin/brands?message=brand+unlisted+successfully')
        }else{
            res.status(404).json({message:"Brand not found"});
        }
    } catch (error) {
        console.log("error on unlist Brand",error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
 }
 //.......................LIST BRAND...........................................................................
 const listBrand = async (req,res)=>{
    try {
        const id = req.query.id;
        const findBrand = await Brand.findByIdAndUpdate(id,{status:true},{new:true});
        if(findBrand){
            res.redirect('/admin/brands?message=brand+listed+successfully')
        }else{
            res.status(404).json({message:"Brand not found"});
        }
    } catch (error) {
        console.log("List brand error",error)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });

    }
 }


 

module.exports = {
    allBrands,
    addBrand,
    deleteBrand,
    editBrand,
    updateBrand,
    unlistBrand,
    listBrand,
   
}